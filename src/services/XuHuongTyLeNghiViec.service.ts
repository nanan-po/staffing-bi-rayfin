
import { getRayfinClient } from "../lib/rayfin-client";

export type DongXuHuongTyLeNghiViec = {
  month: number;
  resigned: number | null;
  previous: number | null;
  rate: number | null;
};

export type BoLocXuHuongTyLeNghiViec = {
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

export async function taiXuHuongTyLeNghiViec(
  filters: BoLocXuHuongTyLeNghiViec
): Promise<DongXuHuongTyLeNghiViec[]> {
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

  const endMonth = month ?? 12;

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
        `,\n            ${column} = ${daxText(value!)}`
    )
    .join("");

  // Lay Measure tung thang.
  // Khong tinh trung binh cac ty le co san.
  const query = `
EVALUATE
VAR BangThang =
    ADDCOLUMNS(
        GENERATESERIES(1, ${endMonth}, 1),

        "__HCNghi",
            VAR ThangNghi = [Value]
            RETURN
                CALCULATE(
                    [NS Nghỉ],
                    FILTER(
                        ALL('D_Date'),
                        'D_Date'[Year] = ${year}
                            && 'D_Date'[Month] = ThangNghi
                    )${extraFilters}
                ),

        "__HCDauThang",
            VAR ThangDau = [Value]
            RETURN
                CALCULATE(
                    [NS LM (Đầu tháng)],
                    FILTER(
                        ALL('D_Date'),
                        'D_Date'[Year] = ${year}
                            && 'D_Date'[Month] = ThangDau
                    )${extraFilters}
                )
    )
RETURN
    SELECTCOLUMNS(
        BangThang,
        "Thang", [Value],
        "HC nghi", [__HCNghi],
        "HC dau thang", [__HCDauThang]
    )
ORDER BY [Thang]
`;

  const result = await getRayfinClient()
    .connectors.staffingvnmpo.executeQuery({
      query,
      resultSetRowCountLimit: 20,
    });

  if (result.status === "error") {
    throw new Error(result.error.message);
  }

  const rows = result.table.rows;

  if (rows.length > 12) {
    throw new Error(
      "Truy vấn trả về số tháng không hợp lệ."
    );
  }

  return rows
    .map((row) => {
      const thang = Number(row[0]);
      const resigned = toNumber(row[1]);
      const previous = toNumber(row[2]);

      return {
        month: thang,
        resigned,
        previous,
        rate:
          resigned !== null &&
          previous !== null &&
          previous > 0
            ? (resigned / previous) * 100
            : null,
      };
    })
    .filter(
      (row) =>
        Number.isInteger(row.month) &&
        row.month >= 1 &&
        row.month <= endMonth
    )
    .sort((a, b) => a.month - b.month);
}
