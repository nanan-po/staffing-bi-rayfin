
import type { PageHrTrendPoint } from "../services/pageHrTrend";

type Props = {
  data: PageHrTrendPoint[];
  loading?: boolean;
  error?: string | null;
};

const chartLeft = 55;
const chartRight = 850;
const lineTop = 50;
const lineBottom = 195;
const barBottom = 292;

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

export default function HeadcountTrend({
  data,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: 40, fontSize: 12 }}>
        Đang tải xu hướng từ Power BI...
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ color: "#b91c1c", fontSize: 12 }}>
        Lỗi lấy dữ liệu xu hướng: {error}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: 40, fontSize: 12 }}>
        Chưa có dữ liệu xu hướng theo bộ lọc đang chọn.
      </p>
    );
  }

  const lineValues = data
    .flatMap((item) => [item.plan, item.actual])
    .filter((value): value is number => value !== null);

  if (lineValues.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: 40, fontSize: 12 }}>
        Power BI chưa trả về dữ liệu Headcount theo tháng.
      </p>
    );
  }

  // Trục Y tự điều chỉnh theo số liệu Power BI
  const minValue = Math.min(...lineValues);
  const maxValue = Math.max(...lineValues);
  const range = Math.max(maxValue - minValue, 100);

  const axisMin = Math.max(
    0,
    Math.floor((minValue - range * 0.15) / 100) * 100
  );

  const axisMax = Math.max(
    axisMin + 100,
    Math.ceil((maxValue + range * 0.15) / 100) * 100
  );

  const getX = (index: number) =>
    data.length === 1
      ? (chartLeft + chartRight) / 2
      : chartLeft +
        (index * (chartRight - chartLeft)) /
          (data.length - 1);

  const getY = (value: number) =>
    lineBottom -
    ((value - axisMin) / (axisMax - axisMin)) *
      (lineBottom - lineTop);

  const getLine = (key: "plan" | "actual") =>
    data
      .map((item, index) =>
        item[key] === null
          ? null
          : `${getX(index)},${getY(item[key])}`
      )
      .filter((point): point is string => point !== null)
      .join(" ");

  const maxMovement = Math.max(
    1,
    ...data.flatMap((item) => [
      item.hired ?? 0,
      item.resigned ?? 0,
    ])
  );

  const barScale = 50 / maxMovement;

  const latest = data[data.length - 1];

  return (
    <div>
      {/* Chú giải */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 12,
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        <span style={{ color: "#64748b" }}>
          ● Định biên kế hoạch
        </span>

        <span style={{ color: "#0865d9" }}>
          ● Nhân sự hiện tại
        </span>

        <span style={{ color: "#16a34a" }}>
          ■ Nhân sự mới
        </span>

        <span style={{ color: "#ef6b5b" }}>
          ■ Nhân sự nghỉ việc
        </span>
      </div>

      <svg
        viewBox="0 0 900 335"
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label="Xu hướng nhân sự kế hoạch và thực tế theo tháng"
      >
        {/* Đường lưới, không hiển thị số trục Y */}
        {[0, 1, 2, 3, 4].map((index) => {
          const y =
            lineTop +
            (index * (lineBottom - lineTop)) / 4;

          return (
            <line
              key={index}
              x1={chartLeft}
              x2={chartRight}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
            />
          );
        })}

        {/* Đường kế hoạch */}
        <polyline
          points={getLine("plan")}
          fill="none"
          stroke="#64748b"
          strokeWidth={2.5}
          strokeDasharray="7 5"
        />

        {/* Đường nhân sự hiện tại */}
        <polyline
          points={getLine("actual")}
          fill="none"
          stroke="#0865d9"
          strokeWidth={3}
        />

        {/* Điểm dữ liệu và nhãn Headcount */}
        {data.map((item, index) => (
          <g key={item.month}>
            {item.plan !== null && (
              <>
                <circle
                  cx={getX(index)}
                  cy={getY(item.plan)}
                  r={4}
                  fill="#64748b"
                >
                  <title>
                    {`${item.label}: Kế hoạch ${formatNumber(item.plan)}`}
                  </title>
                </circle>

                <text
                  x={getX(index)}
                  y={getY(item.plan) - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#64748b"
                  stroke="#ffffff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {formatNumber(item.plan)}
                </text>
              </>
            )}

            {item.actual !== null && (
              <>
                <circle
                  cx={getX(index)}
                  cy={getY(item.actual)}
                  r={4}
                  fill="#0865d9"
                >
                  <title>
                    {`${item.label}: Hiện tại ${formatNumber(item.actual)}`}
                  </title>
                </circle>

                <text
                  x={getX(index)}
                  y={getY(item.actual) + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#0865d9"
                  stroke="#ffffff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {formatNumber(item.actual)}
                </text>
              </>
            )}

            {/* Tháng */}
            <text
              x={getX(index)}
              y={318}
              textAnchor="middle"
              fontSize={12}
              fill="#64748b"
            >
              {item.label}
            </text>
          </g>
        ))}

        {/* Cột nhân sự mới và nghỉ việc */}
        {data.map((item, index) => {
          const x = getX(index);

          const hiredHeight =
            (item.hired ?? 0) * barScale;

          const resignedHeight =
            (item.resigned ?? 0) * barScale;

          return (
            <g key={`movement-${item.month}`}>
              {item.hired !== null && (
                <>
                  <rect
                    x={x - 26}
                    y={barBottom - hiredHeight}
                    width={22}
                    height={hiredHeight}
                    fill="#16a34a"
                  >
                    <title>
                      {`${item.label}: Nhân sự mới ${item.hired}`}
                    </title>
                  </rect>

                  <text
                    x={x - 15}
                    y={barBottom - hiredHeight - 7}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#16a34a"
                  >
                    +{formatNumber(item.hired)}
                  </text>
                </>
              )}

              {item.resigned !== null && (
                <>
                  <rect
                    x={x + 4}
                    y={barBottom - resignedHeight}
                    width={22}
                    height={resignedHeight}
                    fill="#ef6b5b"
                  >
                    <title>
                      {`${item.label}: Nghỉ việc ${item.resigned}`}
                    </title>
                  </rect>

                  <text
                    x={x + 15}
                    y={barBottom - resignedHeight - 7}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#ef6b5b"
                  >
                    -{formatNumber(item.resigned)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Chú thích tự động theo tháng cuối */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#64748b",
          marginTop: 10,
        }}
      >
        HC Plan {latest.label}:{" "}
        {latest.plan === null
          ? "—"
          : formatNumber(latest.plan)}
        {" · "}
        HC thực tế:{" "}
        {latest.actual === null
          ? "—"
          : formatNumber(latest.actual)}
      </p>
    </div>
  );
}
