
import type {
  DongXuHuongTyLeNghiViec,
} from "../services/XuHuongTyLeNghiViec.service";

type Props = {
  data: DongXuHuongTyLeNghiViec[];
  year: number;
  month: number | null;
  loading?: boolean;
  error?: string | null;
};

const CHART_LEFT = 55;
const CHART_RIGHT = 745;
const CHART_TOP = 50;
const CHART_BOTTOM = 215;

const getX = (index: number, count: number) =>
  count <= 1
    ? (CHART_LEFT + CHART_RIGHT) / 2
    : CHART_LEFT +
      (index * (CHART_RIGHT - CHART_LEFT)) /
        (count - 1);

const getY = (rate: number, maxRate: number) =>
  CHART_BOTTOM -
  (rate / maxRate) *
    (CHART_BOTTOM - CHART_TOP);

const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`;

export default function XuHuongTyLeNghiViec({
  data = [],
  year,
  month,
  loading = false,
  error = null,
}: Props) {
  const safeData = Array.isArray(data)
    ? data.filter(
        (item) =>
          Number.isInteger(item.month) &&
          item.month >= 1 &&
          item.month <= 12
      )
    : [];

  const validRates = safeData
    .map((item) => item.rate)
    .filter(
      (rate): rate is number =>
        rate !== null &&
        Number.isFinite(rate) &&
        rate >= 0
    );

  const hasData = validRates.length > 0;

  // Tu dong dieu chinh truc Y theo du lieu
  const highestRate =
    validRates.length > 0
      ? Math.max(...validRates)
      : 0;

  const maxRate = Math.max(
    2,
    Math.ceil((highestRate * 1.25) / 2) * 2
  );

  // Tach duong neu thang nao do thieu du lieu
  const segments: string[][] = [];
  let currentSegment: string[] = [];

  safeData.forEach((item, index) => {
    if (
      item.rate === null ||
      !Number.isFinite(item.rate) ||
      item.rate < 0
    ) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
      return;
    }

    currentSegment.push(
      `${getX(index, safeData.length)},${getY(
        item.rate,
        maxRate
      )}`
    );
  });

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  const latest = [...safeData]
    .reverse()
    .find(
      (item) =>
        item.rate !== null &&
        Number.isFinite(item.rate) &&
        item.rate >= 0
    );

  const periodLabel =
    month === null
      ? `Năm ${year}`
      : `T01–T${String(month).padStart(2, "0")}/${year}`;

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {loading && (
        <p
          style={{
            padding: "32px 0",
            color: "#64748b",
            textAlign: "center",
            fontSize: 12,
          }}
        >
          Đang tải xu hướng nghỉ việc từ Power BI...
        </p>
      )}

      {error && !loading && (
        <p
          role="alert"
          style={{
            padding: "16px 0",
            color: "#b91c1c",
            fontSize: 12,
          }}
        >
          Lỗi Power BI: {error}
        </p>
      )}

      {!loading && !error && !hasData && (
        <p
          style={{
            padding: "32px 0",
            color: "#64748b",
            textAlign: "center",
            fontSize: 12,
          }}
        >
          Chưa có đủ dữ liệu để tính tỷ lệ
          nghỉ việc trong kỳ.
        </p>
      )}

      {!loading && !error && hasData && (
        <>
          <svg
            viewBox="0 0 800 270"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
            role="img"
            aria-label={`Xu hướng tỷ lệ nghỉ việc ${periodLabel}`}
          >
            {/* LUOI NGANG - AN SO TRUC Y */}
            {[0, maxRate / 2, maxRate].map(
              (value) => (
                <line
                  key={value}
                  x1={CHART_LEFT}
                  x2={CHART_RIGHT}
                  y1={getY(value, maxRate)}
                  y2={getY(value, maxRate)}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
              )
            )}

            {/* DUONG XU HUONG */}
            {segments.map((segment, index) => (
              <polyline
                key={index}
                points={segment.join(" ")}
                fill="none"
                stroke="#ef6b5b"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* DIEM DU LIEU VA NHAN */}
            {safeData.map((item, index) => {
              const x = getX(index, safeData.length);

              const monthLabel = `${String(
                item.month
              ).padStart(2, "0")}/${String(
                year
              ).slice(-2)}`;

              const rate =
                item.rate !== null &&
                Number.isFinite(item.rate) &&
                item.rate >= 0
                  ? item.rate
                  : null;

              return (
                <g key={item.month}>
                  {rate !== null && (
                    <>
                      <circle
                        cx={x}
                        cy={getY(rate, maxRate)}
                        r={4}
                        fill="#ef6b5b"
                      >
                        <title>
                          {`${monthLabel}: ${formatPercent(
                            rate
                          )} | Nghỉ: ${
                            item.resigned ?? "—"
                          } | HC đầu tháng: ${
                            item.previous ?? "—"
                          }`}
                        </title>
                      </circle>

                      <text
                        x={x}
                        y={
                          getY(rate, maxRate) - 13
                        }
                        textAnchor="middle"
                        fontSize={11}
                        fill="#ef6b5b"
                      >
                        {formatPercent(rate)}
                      </text>
                    </>
                  )}

                  {/* TRUC THANG */}
                  <text
                    x={x}
                    y={243}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#64748b"
                  >
                    {monthLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          <p
            style={{
              margin: "6px 0 0",
              textAlign: "center",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            {latest
              ? `T${String(latest.month).padStart(
                  2,
                  "0"
                )}/${year} · Tỷ lệ nghỉ việc: ${formatPercent(
                  latest.rate!
                )}`
              : periodLabel}
          </p>
        </>
      )}

      <p
        style={{
          margin: "6px 0 0",
          textAlign: "center",
          color: "#64748b",
          fontSize: 10,
        }}
      >
        Tỷ lệ nghỉ việc theo tháng =
        HC nghỉ / HC đầu tháng × 100%.
      </p>
    </div>
  );
}
