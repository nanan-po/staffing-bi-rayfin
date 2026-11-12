
import { getRayfinClient } from "../lib/rayfin-client";

// 7 Dimension cua bang Tinh hinh nhan su theo don vi
export const NHOM_TINH_HINH_DON_VI = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
  "Nhóm tuổi",
  "Trạng thái NV",
] as const;

export type NhomTinhHinhDonVi =
  (typeof NHOM_TINH_HINH_DON_VI)[number];

export type DongTinhHinhDonVi = {
  values: string[];
  previous: number | null;
  hired: number | null;
  resigned: number | null;
  current: number | null;
};

export type BoLocTinhHinhDonVi = {
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

// Mapping theo F_HR
const COT_NHOM: Record<
  NhomTinhHinhDonVi,
  string
> = {
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
    !text.startsWith("tất cả")
  );
}

function nhanText(
  value: unknown,
  fallback = "Chưa xác định"
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

export async function taiTinhHinhNhanSuTheoDonVi(
  filters: BoLocTinhHinhDonVi,
  groups: string[]
): Promise<DongTinhHinhDonVi[]> {
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

  // Cho phep chon ket hop tu 1 den 7 Dimension
  const activeGroups =
    NHOM_TINH_HINH_DON_VI.filter(
      (group) => groups.includes(group)
    );

  if (activeGroups.length === 0) {
    throw new Error(
      "Cần chọn ít nhất một Dimension"
    );
  }

  const groupColumns = activeGroups.map(
    (group) => COT_NHOM[group]
  );

  // Bo loc thoi gian chung
  const conditions: string[] = [
    `'D_Date'[Year] = ${year}`,
  ];

  // Thang All: khong loc thang, giu ngữ canh nam
  if (month !== null) {
    conditions.push(
      `'D_Date'[Month] = ${month}`
    );
  }

  // Bo loc chung cua Dashboard
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

  for (const [value, column] of filterPairs) {
    if (daChon(value)) {
      conditions.push(
        `${column} = ${daxText(value)}`
      );
    }
  }

  // Su dung Measure co san trong Semantic Model.
  // HC hien tai duoc lay doc lap, khong suy ra
  // tu previous + hired - resigned.
  const query = `
EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        ${groupColumns.join(",\n        ")},
        "HC truoc", [NS LM (Đầu tháng)],
        "HC moi", [NS Mới],
        "HC nghi", [NS Nghỉ],
        "HC hien tai", [NS Hiện tại]
    ),
    ${conditions.join(",\n    ")}
)
ORDER BY
    ${groupColumns.join(",\n    ")}
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

  // Tranh hien tong khong du neu Power BI cat dong
  if (rows.length >= 5000) {
    throw new Error(
      "Kết quả đạt giới hạn 5.000 dòng. " +
      "Hãy thu hẹp bộ lọc để tránh sai tổng."
    );
  }

  const groupCount = activeGroups.length;

  return rows.map((row) => ({
    values: activeGroups.map((_, index) =>
      nhanText(row[index])
    ),
    previous: toNumber(row[groupCount]),
    hired: toNumber(row[groupCount + 1]),
    resigned: toNumber(row[groupCount + 2]),
    current: toNumber(row[groupCount + 3]),
  }));
}
