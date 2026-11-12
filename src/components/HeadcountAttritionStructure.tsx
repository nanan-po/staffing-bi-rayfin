
export type DongCoCauNghiViec = {
  label: string;
  count: number;
};

type Props = {
  data?: DongCoCauNghiViec[];
  dimension?: string;
  loading?: boolean;
  error?: string | null;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

export default function HeadcountAttritionStructure({
  data = [],
  dimension = "Miền",
  loading = false,
  error = null,
}: Props) {
  // Du lieu tu Power BI, khong su dung DEMO
  const safeData = Array.isArray(data)
    ? data.filter(
        (item) =>
          item &&
          Number.isFinite(item.count) &&
          item.count > 0
      )
    : [];

  // Sap xep nhom co so nghi nhieu nhat len dau
  const sortedData = [...safeData].sort(
    (a, b) => b.count - a.count
  );

  const maxCount =
    sortedData.length > 0
      ? Math.max(...sortedData.map((item) => item.count))
      : 0;

  const totalResigned = sortedData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div
      style={{
        marginTop: 24,
        minWidth: 0,
      }}
    >
      {/* TRANG THAI TAI DU LIEU */}
      {loading && (
        <div
          style={{
            padding: "25px 0",
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
          }}
        >
          Đang tải cơ cấu nghỉ việc từ Power BI...
        </div>
      )}

      {/* THONG BAO LOI */}
      {!loading && error && (
        <div
          role="alert"
          style={{
            padding: "15px 0",
            color: "#b91c1c",
            fontSize: 12,
          }}
        >
          Lỗi Power BI: {error}
        </div>
      )}

      {/* KHONG CO DU LIEU */}
      {!loading &&
        !error &&
        sortedData.length === 0 && (
          <div
            style={{
              padding: "25px 0",
              textAlign: "center",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Không có dữ liệu nghỉ việc theo {dimension}.
          </div>
        )}

      {/* BIEU DO THANH NGANG */}
      {!loading &&
        !error &&
        sortedData.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gap: 18,
                maxHeight: 250,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {sortedData.map((item, index) => {
                const barWidth =
                  maxCount > 0
                    ? (item.count / maxCount) * 100
                    : 0;

                const rate =
                  totalResigned > 0
                    ? (item.count / totalResigned) * 100
                    : 0;

                const label =
                  item.label?.trim() ||
                  "Chưa xác định";

                return (
                  <div
                    key={`${label}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "80px minmax(0, 1fr) 42px",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {/* TEN NHOM */}
                    <span
                      title={label}
                      style={{
                        fontSize: 12,
                        color: "#153b73",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>

                    {/* THANH BIEU DO */}
                    <div
                      style={{
                        height: 16,
                        background: "#fde9e6",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                      role="img"
                      aria-label={`${label}: ${formatNumber(
                        item.count
                      )} nhân sự nghỉ, chiếm ${rate.toFixed(1)}%`}
                      title={`${label}: ${formatNumber(
                        item.count
                      )} người (${rate.toFixed(1)}%)`}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: "100%",
                          background: "#ed786b",
                          borderRadius: 3,
                          transition: "width 0.2s ease",
                        }}
                      />
                    </div>

                    {/* SO LUONG NGHI */}
                    <strong
                      style={{
                        fontSize: 12,
                        color: "#d65f51",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatNumber(item.count)}
                    </strong>
                  </div>
                );
              })}
            </div>

            {/* DONG TONG */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                borderTop: "1px solid #dbe5f1",
                marginTop: 26,
                paddingTop: 14,
                color: "#153b73",
                fontSize: 12,
              }}
            >
              <span>Tổng nhân sự nghỉ việc</span>

              <strong>
                {formatNumber(totalResigned)}
              </strong>
            </div>
          </>
        )}
    </div>
  );
}
