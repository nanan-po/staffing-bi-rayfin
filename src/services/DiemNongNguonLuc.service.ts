import { getRayfinClient } from "../lib/rayfin-client";

export type NhomDiemNong =
  | "Miền"
  | "Tỉnh"
  | "Vị trí"
  | "Quản lý cấp 1"
  | "Quản lý cấp 2";

// Mỗi dòng có thể chứa từ 1 đến 5 cột phân nhóm
export type DongDiemNong = {
  values: string[];
  plan: number | null;
  actual: number | null;
  vacant: number | null;
};

export type BoLocDiemNong = {
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

// Thứ tự Dimension cố định
const thuTuNhom: NhomDiemNong[] = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
];

const cotPhanNhom: Record<NhomDiemNong, string> = {
  "Miền": "'F_HC PLAN'[Region]",
  "Tỉnh": "'F_HC PLAN'[Old Province]",
  "Vị trí": "'F_HC PLAN'[Position]",
  "Quản lý cấp 1": "'F_HC PLAN'[Level 1 Manager Name]",
  "Quản lý cấp 2": "'F_HC PLAN'[Level 2 Manager Name]",
};

function daxText(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hasFilter(value: string | null | undefined): value is string {
  if (!value) return false;

  const text = value.trim();

  return (
    text !== "" &&
    text !== "All" &&
    !text.startsWith("Tất cả")
  );
}

// NHẬN MẢNG DIMENSION THAY VÌ MỘT DIMENSION
export async function taiDuLieuDiemNong(
  filters: BoLocDiemNong,
  groups: NhomDiemNong[]
): Promise<DongDiemNong[]> {
  const year = Number(filters.year);

  if (!Number.isInteger(year)) {
    throw new Error("Năm không hợp lệ");
  }

  if (
    filters.month !== null &&
    (!Number.isInteger(filters.month) ||
      filters.month < 1 ||
      filters.month > 12)
  ) {
    throw new Error("Tháng không hợp lệ");
  }

  // Giữ thứ tự của 5 Dimension
  const nhomHienThi = thuTuNhom.filter((group) =>
    groups.includes(group)
  );

  if (nhomHienThi.length === 0) {
    throw new Error("Cần chọn ít nhất một Dimension");
  }

  const groupColumns = nhomHienThi.map(
    (group) => cotPhanNhom[group]
  );

  // Bộ lọc chung của Dashboard
  const boLoc = [
    [filters.project, "'F_HC PLAN'[Project Name]"],
    [filters.channel, "'F_HC PLAN'[Channel]"],
    [filters.region, "'F_HC PLAN'[Region]"],
    [filters.province, "'F_HC PLAN'[Old Province]"],
    [filters.position, "'F_HC PLAN'[Position]"],
    [filters.manager1, "'F_HC PLAN'[Level 1 Manager Name]"],
    [filters.manager2, "'F_HC PLAN'[Level 2 Manager Name]"],
  ] as const;

  const dieuKien: string[] = [];

  for (const [value, column] of boLoc) {
    if (hasFilter(value)) {
      dieuKien.push(
        `${column} = ${daxText(value)}`
      );
    }
  }

  const filterDax = dieuKien
    .map((condition) => ",\n    " + condition)
    .join("");

  // Nếu chọn All tháng: lấy snapshot mới nhất trong năm
  const selectedMonth =
    filters.month === null
      ? "IF(ISBLANK(_LatestDate), -1, MONTH(_LatestDate))"
      : String(filters.month);

  // DAX phân nhóm theo tất cả Dimension đã chọn
  const query = `
EVALUATE
VAR _LatestDate =
    CALCULATE(
        MAX('F_HC PLAN'[Report Month]),
        FILTER(
            ALL('F_HC PLAN'[Report Month]),
            YEAR('F_HC PLAN'[Report Month]) = ${year}
        )
        ${filterDax}
    )
VAR _TargetMonth = ${selectedMonth}
RETURN
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        ${groupColumns.join(",\n        ")},
        "HC ke hoach", SUM('F_HC PLAN'[HC Plan]),
        "HC hien tai", [NS Hiện tại theo hc_plan],
        "Vacant", SUM('F_HC PLAN'[Vacant])
    ),
    FILTER(
        ALL('F_HC PLAN'[Report Month]),
        YEAR('F_HC PLAN'[Report Month]) = ${year}
        && MONTH('F_HC PLAN'[Report Month]) = _TargetMonth
    )
    ${filterDax}
)
ORDER BY ${groupColumns.join(", ")}
`;

  const result =
    await getRayfinClient().connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 5000,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  // Số cột Dimension thay đổi theo nhóm đã chọn
  const soCotNhom = nhomHienThi.length;

  return result.table.rows.map((row) => ({
    values: nhomHienThi.map((_, index) => {
      const value = row[index];

      return value === null ||
        value === undefined ||
        String(value).trim() === ""
        ? "Chưa xác định"
        : String(value);
    }),
    plan: toNumber(row[soCotNhom]),
    actual: toNumber(row[soCotNhom + 1]),
    vacant: toNumber(row[soCotNhom + 2]),
  }));
}