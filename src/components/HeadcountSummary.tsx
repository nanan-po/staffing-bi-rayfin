import type { loadPageHrKpi } from "../services/pageHrKpi";

type PageHrKpi = Awaited<ReturnType<typeof loadPageHrKpi>>;

type Props = {
  kpi: PageHrKpi | null;
  loading?: boolean;
  error?: string | null;
  year: number;
  month: number | null;
};

function formatNumber(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("en-US");
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : (value * 100).toFixed(1) + "%";
}

export default function HeadcountSummary({
  kpi,
  loading = false,
  error = null,
  year,
  month,
}: Props) {
  // Tiêu đề thay đổi theo bộ lọc Năm và Tháng
  const periodLabel =
    month === null
      ? `YTD ${year}`
      : `T${String(month).padStart(2, "0")}/${year}`;

  // Dữ liệu trực tiếp từ Measure 1.PAGE HR
  const currentHC = kpi?.["NS Hiện tại"] ?? null;
  const plannedHC = kpi?.["NS Kế hoạch"] ?? null;
  const missingHC = kpi?.["NS còn thiếu"] ?? null;
  const achievement = kpi?.["Tỷ lệ thực đạt (%)"] ?? null;
  const missingRate = kpi?.["Tỷ lệ NS thiếu (%)"] ?? null;

  const newEmployees = kpi?.["NS Mới"] ?? null;
  const resignedEmployees = kpi?.["NS Nghỉ"] ?? null;
  const netChange = kpi?.["Biến động Mới-Nghỉ"] ?? null;
  const turnoverRate = kpi?.["Tỷ lệ Nghỉ (%)"] ?? null;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #dbe5f1",
    borderRadius: 10,
    padding: 16,
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <section style={cardStyle}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13 }}>
          QUY MÔ NHÂN SỰ HIỆN TẠI
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 32, color: "#153b73" }}>
              {loading && !kpi
                ? "Đang tải..."
                : formatNumber(currentHC)}
            </div>

            <div style={{ fontSize: 12 }}>
              NS Kế hoạch: {formatNumber(plannedHC)}
            </div>
          </div>

          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "6px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {loading
              ? "Đang tải"
              : kpi
                ? "Theo kỳ đang chọn"
                : "Chưa có dữ liệu"}
          </span>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: 12 }}>
            Tỷ lệ thực đạt
          </div>

          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {formatPercent(achievement)}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 12 }}>
            Nhân sự còn thiếu
          </div>

          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {formatNumber(missingHC)}
          </div>

          <div style={{ fontSize: 11, color: "#64748b" }}>
            Tỷ lệ thiếu: {formatPercent(missingRate)}
          </div>
        </div>
      </div>

      <section style={cardStyle}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13 }}>
          BIẾN ĐỘNG NHÂN SỰ ({periodLabel})
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
          }}
        >
          {[
            {
              label: "Nhân sự mới",
              value: newEmployees,
            },
            {
              label: "Nghỉ việc",
              value: resignedEmployees,
            },
            {
              label: "Biến động",
              value: netChange,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#eaf2fc",
                padding: 8,
                textAlign: "center",
                borderRadius: 5,
              }}
            >
              <div style={{ fontSize: 11 }}>
                {item.label}
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {formatNumber(item.value)}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "#64748b",
          }}
        >
          Tỷ lệ nghỉ việc: {formatPercent(turnoverRate)}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          style={{
            padding: 10,
            color: "#b91c1c",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          Lỗi lấy dữ liệu Power BI: {error}
        </div>
      )}
    </div>
  );
}