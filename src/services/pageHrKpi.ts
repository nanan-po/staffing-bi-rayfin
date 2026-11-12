import { getRayfinClient } from "../lib/rayfin-client";

export type PageHrFilters = {
  year: number;
  month: number | null;
  project: string | null;
  channel: string | null;
  region: string | null;
  province: string | null;
  position: string | null;
  manager1: string | null;
  manager2: string | null;
};

export type PageHrFilterKey = keyof PageHrFilters;

export const defaultPageHrFilters: PageHrFilters = {
  year: 2026,
  month: 10,
  project: null,
  channel: null,
  region: null,
  province: null,
  position: null,
  manager1: null,
  manager2: null,
};

const filterColumns = [
  { key: "year", column: "'D_Date'[Year]", numeric: true },
  { key: "month", column: "'D_Date'[Month]", numeric: true },
  { key: "project", column: "'F_HR'[Project Name]", numeric: false },
  { key: "channel", column: "'F_HR'[Channel]", numeric: false },
  { key: "region", column: "'F_HR'[Region]", numeric: false },
  { key: "province", column: "'F_HR'[Old Province]", numeric: false },
  { key: "position", column: "'F_HR'[Position]", numeric: false },
  { key: "manager1", column: "'F_HR'[Level 1 Manager Name]", numeric: false },
  { key: "manager2", column: "'F_HR'[Level 2 Manager Name]", numeric: false },
] as const;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error("Power BI trả về giá trị số không hợp lệ");
  }
  return number;
}

// Thoát ký tự nháy kép khi đưa giá trị lọc vào DAX
function daxString(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

// Lấy 9 Measure theo các Filter đang chọn
export async function loadPageHrKpi(filters: PageHrFilters) {
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
  ];

  if (filters.month !== null) {
    conditions.push(`'D_Date'[Month] = ${filters.month}`);
  }

  const textFilters = [
    ["project", "'F_HR'[Project Name]"],
    ["channel", "'F_HR'[Channel]"],
    ["region", "'F_HR'[Region Code]"],
    ["province", "'F_HR'[Old Province]"],
    ["position", "'F_HR'[Position]"],
    ["manager1", "'F_HR'[Level 1 Manager Name]"],
    ["manager2", "'F_HR'[Level 2 Manager Name]"],
  ] as const;

  for (const [key, column] of textFilters) {
    const value = filters[key];
    if (value) {
      conditions.push(`${column} = ${daxString(value)}`);
    }
  }

  const query = `
EVALUATE
CALCULATETABLE(
    ROW(
        "NS Hiện tại", [NS Hiện tại],
        "NS Kế hoạch", [NS Kế hoạch],
        "Tỷ lệ thực đạt (%)", [Tỷ lệ thực đạt (%)],
        "NS còn thiếu", [NS còn thiếu],
        "Tỷ lệ NS thiếu (%)", [Tỷ lệ NS thiếu (%)],
        "NS Mới", [NS Mới],
        "NS Nghỉ", [NS Nghỉ],
        "Biến động Mới-Nghỉ", [Biến động Mới-Nghỉ],
        "Tỷ lệ Nghỉ (%)", [Tỷ lệ Nghỉ (%)]
    ),
    ${conditions.join(",\n    ")}
)
`;

  const client = getRayfinClient();
  const result =
    await client.connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 1,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const row = result.table.rows[0];

  if (!row) {
    throw new Error("Power BI không trả về dữ liệu KPI");
  }

  return {
    "NS Hiện tại": toNumber(row[0]),
    "NS Kế hoạch": toNumber(row[1]),
    "Tỷ lệ thực đạt (%)": toNumber(row[2]),
    "NS còn thiếu": toNumber(row[3]),
    "Tỷ lệ NS thiếu (%)": toNumber(row[4]),
    "NS Mới": toNumber(row[5]),
    "NS Nghỉ": toNumber(row[6]),
    "Biến động Mới-Nghỉ": toNumber(row[7]),
    "Tỷ lệ Nghỉ (%)": toNumber(row[8]),
  };
}

// Lấy danh sách giá trị của 9 Filter trực tiếp từ Power BI
export async function loadPageHrFilterOptions(): Promise<
  Record<PageHrFilterKey, string[]>
> {
  const queryParts = filterColumns.map((field) => {
    const valueExpression = field.numeric
      ? `FORMAT(${field.column}, "0")`
      : `"" & ${field.column}`;

    return `
SELECTCOLUMNS(
    FILTER(
        VALUES(${field.column}),
        NOT(ISBLANK(${field.column}))
    ),
    "Filter", "${field.key}",
    "Value", ${valueExpression}
)`;
  });

  const query = `
EVALUATE
UNION(
    ${queryParts.join(",\n    ")}
)
ORDER BY [Filter], [Value]
`;

  const result =
    await getRayfinClient().connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 3000,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const options: Record<PageHrFilterKey, string[]> = {
    year: [],
    month: [],
    project: [],
    channel: [],
    region: [],
    province: [],
    position: [],
    manager1: [],
    manager2: [],
  };

  for (const row of result.table.rows) {
    const key = String(row[0]) as PageHrFilterKey;
    const value = row[1] == null ? "" : String(row[1]).trim();

    if (Object.prototype.hasOwnProperty.call(options, key) && value) {
      if (!options[key].includes(value)) {
        options[key].push(value);
      }
    }
  }

  for (const key of Object.keys(options) as PageHrFilterKey[]) {
    if (key === "year") {
      options[key].sort((a, b) => Number(b) - Number(a));
    } else if (key === "month") {
      options[key].sort((a, b) => Number(a) - Number(b));
    } else {
      options[key].sort((a, b) => a.localeCompare(b, "vi"));
    }
  }

  return options;
}