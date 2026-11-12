import { getRayfinClient } from "../lib/rayfin-client";
import type { PageHrFilters } from "./pageHrKpi";

export type PageHrTrendPoint = {
  month: number;
  label: string;
  actual: number | null;
  plan: number | null;
  hired: number | null;
  resigned: number | null;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Chuyển giá trị bộ lọc thành chuỗi DAX an toàn
function daxString(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

// Lấy dữ liệu 4 Measure theo từng tháng từ Power BI
export async function loadPageHrTrend(
  filters: PageHrFilters
): Promise<PageHrTrendPoint[]> {
  if (!Number.isInteger(filters.year)) {
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

  const conditions: string[] = [
    `'D_Date'[Year] = ${filters.year}`,
    "'D_Date'[Month] >= 1",
  ];

  // Khi chọn T10, hiển thị xu hướng từ T01 đến T10
  if (filters.month !== null) {
    conditions.push(
      `'D_Date'[Month] <= ${filters.month}`
    );
  }

  // Sử dụng cùng bộ lọc với KPI Page HR
  const textFilters = [
    ["project", "'F_HR'[Project Name]"],
    ["channel", "'F_HR'[Channel]"],
    ["region", "'F_HR'[Region]"],
    ["province", "'F_HR'[Old Province]"],
    ["position", "'F_HR'[Position]"],
    ["manager1", "'F_HR'[Level 1 Manager Name]"],
    ["manager2", "'F_HR'[Level 2 Manager Name]"],
  ] as const;

  for (const [key, column] of textFilters) {
    const value = filters[key];

    if (value) {
      conditions.push(
        `${column} = ${daxString(value)}`
      );
    }
  }

  const query = `
EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        'D_Date'[Month],
        "NS Hiện tại", [NS Hiện tại],
        "NS Kế hoạch", [NS Kế hoạch],
        "NS Mới", [NS Mới],
        "NS Nghỉ", [NS Nghỉ]
    ),
    ${conditions.join(",\n    ")}
)
ORDER BY 'D_Date'[Month]
`;

  const client = getRayfinClient();

  const result =
    await client.connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 12,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const points: PageHrTrendPoint[] = [];

  for (const row of result.table.rows) {
    const month = Number(row[0]);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      continue;
    }

    points.push({
      month,
      label:
        String(month).padStart(2, "0") +
        "/" +
        String(filters.year).slice(-2),
      actual: toNumber(row[1]),
      plan: toNumber(row[2]),
      hired: toNumber(row[3]),
      resigned: toNumber(row[4]),
    });
  }

  return points.sort((a, b) => a.month - b.month);
}