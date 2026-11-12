
import { getRayfinClient } from "../lib/rayfin-client";

export const NHOM_CO_CAU_HIEN_TAI = [
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

export type NhomCoCauHienTai =
  (typeof NHOM_CO_CAU_HIEN_TAI)[number];

export type DongCoCauNhanSuHienTai = {
  label: string;
  count: number;
};

export type KetQuaCoCauNhanSuHienTai = {
  data: DongCoCauNhanSuHienTai[];
  total: number | null;
};

export type BoLocCoCauHienTai = {
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

const COT_NHOM: Record<NhomCoCauHienTai, string> = {
  "Miền": "'F_HR'[Region]",
  "Tỉnh": "'F_HR'[Old Province]",
  "Vị trí": "'F_HR'[Position]",
  "Quản lý cấp 1": "'F_HR'[Level 1 Manager Name]",
  "Quản lý cấp 2": "'F_HR'[Level 2 Manager Name]",
  "Giới tính": "'F_HR'[Gender]",
  "Nhóm tuổi": "'F_HR'[Age Group]",
  "Học vấn": "'F_HR'[Education]",
  "Thâm niên": "'F_HR'[Tenure Group]",
  "Trạng thái NV": "'F_HR'[Employee Status]",
};

function daxText(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function daChon(
  value: string | null | undefined
): value is string {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();

  return (
    normalized !== "" &&
    normalized !== "all" &&
    normalized !== "tất cả" &&
    !normalized.startsWith("tất cả ")
  );
}

function toNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function toText(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Chưa xác định";
  }

  return String(value).trim();
}

export async function taiCoCauNhanSuHienTai(
  filters: BoLocCoCauHienTai,
  dimension: string
): Promise<KetQuaCoCauNhanSuHienTai> {
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

  const selected = NHOM_CO_CAU_HIEN_TAI.includes(
    dimension as NhomCoCauHienTai
  )
    ? (dimension as NhomCoCauHienTai)
    : "Miền";

  const groupColumn = COT_NHOM[selected];

  // Loc theo nam va thang cua Dashboard.
  // Khi chon All, Measure NS Hien tai se
  // quyet dinh moc snapshot trong nam.
  const dateCondition =
    `'D_Date'[Year] = ${year}` +
    (
      month === null
        ? ""
        : ` && 'D_Date'[Month] = ${month}`
    );

  const dateFilter = `
FILTER(
    ALL('D_Date'),
    ${dateCondition}
)`;

  const filterPairs = [
    [filters.project, "'F_HR'[Project Name]"],
    [filters.channel, "'F_HR'[Channel]"],
    [filters.region, "'F_HR'[Region]"],
    [filters.province, "'F_HR'[Old Province]"],
    [filters.position, "'F_HR'[Position]"],
    [filters.manager1, "'F_HR'[Level 1 Manager Name]"],
    [filters.manager2, "'F_HR'[Level 2 Manager Name]"],
  ] as const;

  const extraFilters = filterPairs
    .filter(([value]) => daChon(value))
    .map(
      ([value, column]) =>
        `${column} = ${daxText(value!)}`
    );

  const daxFilters = [
    dateFilter,
    ...extraFilters,
  ].join(",\n        ");

  // Lay tong tu Power BI doc lap voi cac nhom.
  const query = `
EVALUATE
VAR BangNhom =
    CALCULATETABLE(
        SUMMARIZECOLUMNS(
            ${groupColumn},
            "__HC", [NS Hiện tại]
        ),
        ${daxFilters}
    )
VAR TongNhanSu =
    CALCULATE(
        [NS Hiện tại],
        ${daxFilters}
    )
RETURN
    UNION(
        SELECTCOLUMNS(
            BangNhom,
            "Nhom", ${groupColumn},
            "HC", [__HC],
            "LaTong", FALSE()
        ),
        ROW(
            "Nhom", "Tổng",
            "HC", TongNhanSu,
            "LaTong", TRUE()
        )
    )
ORDER BY
    [LaTong] ASC,
    [HC] DESC
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

  const totalRow = rows.find(
    (row) =>
      row[2] === true ||
      String(row[2]).toLowerCase() === "true"
  );

  const total = totalRow
    ? toNumber(totalRow[1])
    : null;

  const data = rows
    .filter(
      (row) =>
        row[2] !== true &&
        String(row[2]).toLowerCase() !== "true"
    )
    .map((row) => ({
      label: toText(row[0]),
      count: toNumber(row[1]) ?? 0,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    data,
    total,
  };
}
