
import { getRayfinClient } from "../lib/rayfin-client";

// 7 Dimension cua bang Phan tich nghi viec
export const NHOM_NGHI_VIEC = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
  "Nhóm tuổi",
  "Trạng thái NV",
] as const;

export type NhomNghiViec =
  (typeof NHOM_NGHI_VIEC)[number];

export type DongPhanTichNghiViec = {
  values: string[];

  // Nhom ly do nghi
  reason: string;

  // Ly do nghi chi tiet
  reasonDetail: string;

  count: number;
};

export type BoLocPhanTichNghiViec = {
  year: number;
  month: number | null;
  project?: string | null;
  channel?: string | null;
  region?: string | null;
  province?: string | null;
  position?: string | null;
  manager1?: string | null;
  manager2?: string | null;
};

// Mapping Dimension voi cot trong F_HR
const COT_NHOM: Record<NhomNghiViec, string> = {
  "Miền": "'F_HR'[Region]",
  "Tỉnh": "'F_HR'[Old Province]",
  "Vị trí": "'F_HR'[Position]",
  "Quản lý cấp 1":
    "'F_HR'[Level 1 Manager Name]",
  "Quản lý cấp 2":
    "'F_HR'[Level 2 Manager Name]",
  "Nhóm tuổi": "'F_HR'[Age Group]",
  "Trạng thái NV": "'F_HR'[Employee Status]",
};

function daxText(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

function daChon(
  value: string | null | undefined
): value is string {
  if (!value) return false;

  const text = value.trim().toLowerCase();

  return (
    text !== "" &&
    text !== "all" &&
    text !== "tất cả" &&
    !text.startsWith("tất cả ")
  );
}

function nhanText(
  value: unknown,
  fallback: string
): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value).trim();
}

export async function taiPhanTichNghiViecTheoNhom(
  filters: BoLocPhanTichNghiViec,
  groups: string[]
): Promise<DongPhanTichNghiViec[]> {
  const year = Number(filters.year);

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error("Năm báo cáo không hợp lệ");
  }

  const month =
    filters.month === null
      ? null
      : Number(filters.month);

  if (
    month !== null &&
    (!Number.isInteger(month) ||
      month < 1 ||
      month > 12)
  ) {
    throw new Error("Tháng báo cáo không hợp lệ");
  }

  // Cho phep chon ket hop 1-7 Dimension
  const activeGroups = NHOM_NGHI_VIEC.filter(
    (item) => groups.includes(item)
  );

  if (activeGroups.length === 0) {
    throw new Error(
      "Cần chọn ít nhất một Dimension"
    );
  }

  const groupColumns = activeGroups.map(
    (item) => COT_NHOM[item]
  );

  // Bo loc chung tu Dashboard
  const filterPairs = [
    [filters.project, "'F_HR'[Project Name]"],
    [filters.channel, "'F_HR'[Channel]"],
    [filters.region, "'F_HR'[Region]"],
    [filters.province, "'F_HR'[Old Province]"],
    [filters.position, "'F_HR'[Position]"],
    [
      filters.manager1,
      "'F_HR'[Level 1 Manager Name]",
    ],
    [
      filters.manager2,
      "'F_HR'[Level 2 Manager Name]",
    ],
  ] as const;

  const extraFilters = filterPairs
    .filter(([value]) => daChon(value))
    .map(
      ([value, column]) =>
        `,\n    ${column} = ${daxText(value!)}`
    )
    .join("");

  // Thang cu the: dem nhan su nghi trong thang
  // Thang All: dem nhan su nghi trong nam
  const startMonth = month === null ? 1 : month;
  const endMonth = month === null ? 12 : month;

  // DAX:
  // 1. Phan nhom theo cac Dimension da chon
  // 2. Phan nhom theo Resign Reason Group
  // 3. Phan nhom theo Resign Reason chi tiet
  // 4. Dem ma nhan vien duy nhat moi to hop
  const query = `
EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        ${groupColumns.join(",\n        ")},
        'F_HR'[Resign Reason Group],
        'F_HR'[Resign Reason],
        "So luong",
        DISTINCTCOUNT('F_HR'[Employee Code (Company)])
    ),
    FILTER(
        ALL('F_HR'[Resign Date]),
        NOT ISBLANK('F_HR'[Resign Date])
            && 'F_HR'[Resign Date] >=
                DATE(${year}, ${startMonth}, 1)
            && 'F_HR'[Resign Date] <
                EDATE(
                    DATE(${year}, ${endMonth}, 1),
                    1
                )
    ),
    FILTER(
        ALL('F_HR'[Employee Code (Company)]),
        NOT ISBLANK(
            'F_HR'[Employee Code (Company)]
        )
    )${extraFilters}
)
ORDER BY
    ${[
      ...groupColumns,
      "'F_HR'[Resign Reason Group]",
      "'F_HR'[Resign Reason]",
    ].join(",\n    ")}
`;

  const result =
    await getRayfinClient()
      .connectors.staffingvnmpo.executeQuery({
        query,
        resultSetRowCountLimit: 5000,
      });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const rows = result.table.rows;

  // Khong hien tong neu du lieu bi cat dong
  if (rows.length >= 5000) {
    throw new Error(
      "Kết quả đạt giới hạn 5.000 dòng. " +
        "Hãy thu hẹp bộ lọc để tránh sai tổng."
    );
  }

  const groupCount = activeGroups.length;

  // Thu tu cot ket qua:
  // 0 ... groupCount - 1: Cac Dimension
  // groupCount: Resign Reason Group
  // groupCount + 1: Resign Reason
  // groupCount + 2: So luong
  return rows
    .map((row) => ({
      values: activeGroups.map((_, index) =>
        nhanText(row[index], "Chưa xác định")
      ),

      reason: nhanText(
        row[groupCount],
        "Chưa cập nhật"
      ),

      reasonDetail: nhanText(
        row[groupCount + 1],
        "Chưa cập nhật"
      ),

      count:
        Number(row[groupCount + 2]) || 0,
    }))
    .filter((row) => row.count > 0);
}
