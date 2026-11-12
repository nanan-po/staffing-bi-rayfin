
import type {
  DongCoCauNhanSuHienTai,
} from "../services/CoCauNhanSuHienTai.service";

type Props = {
  dimension: string;
  data: DongCoCauNhanSuHienTai[];
  total: number | null;
  loading?: boolean;
  error?: string | null;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

export default function CoCauNhanSuHienTai({
  dimension = "Miền",
  data = [],
  total = null,
  loading = false,
  error = null,
}: Props) {
  const safeData = Array.isArray(data)
    ? data.filter(
        (row) =>
          row &&
          Number.isFinite(row.count) &&
          row.count > 0
      )
    : [];

  const sortedData = [...safeData].sort(
    (a, b) => b.count - a.count
  );

  const maxCount =
    sortedData.length > 0
      ? Math.max(...sortedData.map((row) => row.count))
      : 0;

  const sumGroups = sortedData.reduce(
    (sum, row) => sum + row.count,
    0
  );

  const validTotal =
    total !== null &&
    Number.isFinite(total)
      ? total
      : null;

  const isMismatch =
    validTotal !== null &&
    sumGroups !== validTotal;

  return (
    <div
      style={{
        marginTop: 24,
        minWidth: 0,
      }}
    >
      {loading && (
        <div
          style={{
            padding: "25px 0",
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
          }}
        >
          Đang tải cơ cấu nhân sự hiện tại...
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          style={{
            padding: "15px 0",
            color: "#b91c1c",
            fontSize: 12,
            overflowWrap: "break-word",
          }}
        >
          Lỗi Power BI: {error}
        </div>
      )}

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
            Không có dữ liệu nhân sự theo {dimension}.
          </div>
        )}

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
              {sortedData.map((row, index) => {
                const label =
                  row.label?.trim() ||
                  "Chưa xác định";

                const width =
                  maxCount > 0
                    ? (row.count / maxCount) * 100
                    : 0;

                const rate =
                  validTotal !== null &&
                  validTotal > 0
                    ? (row.count / validTotal) * 100
                    : null;

                return (
                  <div
                    key={`${label}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "80px minmax(0, 1fr) 48px",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      title={label}
                      style={{
                        fontSize: 12,
                        color: "#153b73",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {label}
                    </span>

                    <div
                      role="img"
                      aria-label={
                        `${label}: ${formatNumber(row.count)} nhân sự`
                      }
                      title={
                        `${label}: ${formatNumber(row.count)}` +
                        (
                          rate === null
                            ? ""
                            : ` (${rate.toFixed(1)}%)`
                        )
                      }
                      style={{
                        height: 16,
                        background: "#e8f1fb",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${width}%`,
                          height: "100%",
                          background: "#0865d9",
                          borderRadius: 3,
                          transition: "width 0.2s ease",
                        }}
                      />
                    </div>

                    <strong
                      style={{
                        color: "#0865d9",
                        fontSize: 12,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatNumber(row.count)}
                    </strong>
                  </div>
                );
              })}
            </div>

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
              <span>Tổng nhân sự hiện tại</span>

              <strong>
                {validTotal === null
                  ? "—"
                  : formatNumber(validTotal)}
              </strong>
            </div>

            {isMismatch && (
              <div
                style={{
                  marginTop: 8,
                  color: "#b45309",
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                Lưu ý: Tổng các nhóm là{" "}
                {formatNumber(sumGroups)}, khác tổng
                Power BI là{" "}
                {formatNumber(validTotal!)}.
                Cần kiểm tra ngữ cảnh lọc hoặc
                phân nhóm nhân sự.
              </div>
            )}
          </>
        )}
    </div>
  );
}
