
import { getRayfinClient } from "../lib/rayfin-client";

// 10 Dimension khop voi HeadcountGroupControl
export const NHOM_CO_CAU_NGHI_VIEC = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
  "Giới tính",
  "Nhóm tuổi",
  "Học vấn",
  "Thâm niên",
  "Trạng thái NV",
] as const;

export type NhomCoCauNghiViec =
  (typeof NHOM_CO_CAU_NGHI_VIEC)[number];

export type DongCoCauNghiViec = {
  label: string;
  count: number;
};

export type BoLocCoCauNghiViec = {
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

// Ba cot danh dau CAN XAC MINH
// vi chua co ten truong chinh xac trong Power BI.
const COT_NHOM: Record<NhomCoCauNghiViec, string> = {
  "Miền": "'F_HR'[Region]",
  "Tỉnh": "'F_HR'[Old Province]",
  "Vị trí": "'F_HR'[Position]",
  "Quản lý cấp 1": "'F_HR'[Level 1 Manager Name]",
  "Quản lý cấp 2": "'F_HR'[Level 2 Manager Name]",
  "Giới tính": "'F_HR'[Gender]", // CAN XAC MINH
  "Nhóm tuổi": "'F_HR'[Age Group]",
  "Học vấn": "'F_HR'[Education]", // CAN XAC MINH
  "Thâm niên": "'F_HR'[Tenure Group]", // CAN XAC MINH
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

function nhanText(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Chưa xác định";
  }

  return String(value).trim();
}

export async function taiCoCauNhanSuNghiViec(
  filters: BoLocCoCauNghiViec,
  dimension: string
): Promise<DongCoCauNghiViec[]> {
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

  // Xac dinh Dimension dang duoc chon
  const selected: NhomCoCauNghiViec =
    NHOM_CO_CAU_NGHI_VIEC.includes(
      dimension as NhomCoCauNghiViec
    )
      ? (dimension as NhomCoCauNghiViec)
      : "Miền";

  const groupColumn = COT_NHOM[selected];

  // 9 bo loc chung cua Dashboard
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

  // Thang cu the: nghi trong thang
  // Thang All: nghi trong ca nam bao cao
  const startMonth = month ?? 1;
  const endMonth = month ?? 12;

  // DAX dem DISTINCT ma nhan vien theo Dimension
  const query = `
EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        ${groupColumn},
        "So luong",
        DISTINCTCOUNT('F_HR'[Employee Code (Company)])
    ),
    FILTER(
        ALL('F_HR'[Resign Date]),
        NOT ISBLANK('F_HR'[Resign Date])
            && 'F_HR'[Resign Date] >=
                DATE(${year}, ${startMonth}, 1)
            && 'F_HR'[Resign Date] <
                EDATE(DATE(${year}, ${endMonth}, 1), 1)
    ),
    FILTER(
        ALL('F_HR'[Employee Code (Company)]),
        NOT ISBLANK('F_HR'[Employee Code (Company)])
    )${extraFilters}
)
ORDER BY ${groupColumn}
`;

  const result = await getRayfinClient()
    .connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 5000,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const rows = result.table.rows;

  if (rows.length >= 5000) {
    throw new Error(
      "Kết quả đạt giới hạn 5.000 dòng. " +
      "Hãy thu hẹp bộ lọc để tránh sai tổng."
    );
  }

  return rows
    .map((row) => ({
      label: nhanText(row[0]),
      count: Number(row[1]) || 0,
    }))
    .filter(
      (row) =>
        Number.isFinite(row.count) &&
        row.count > 0
    )
    .sort((a, b) => b.count - a.count);
}
