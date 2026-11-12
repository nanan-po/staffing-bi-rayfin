
import { Component, useEffect, useState, type ReactNode } from "react";

import {
  loadPageHrKpi,
  defaultPageHrFilters,
  type PageHrFilters,
} from "../services/pageHrKpi";

import {
  loadPageHrTrend,
  type PageHrTrendPoint,
} from "../services/pageHrTrend";

import {
  taiDuLieuDiemNong,
  type NhomDiemNong,
  type DongDiemNong,
} from "../services/DiemNongNguonLuc.service";

import {
  taiPhanTichNghiViecTheoNhom,
  type DongPhanTichNghiViec,
} from "../services/PhanTichNghiViecTheoNhom.service";

import {
  taiTinhHinhNhanSuTheoDonVi,
  type DongTinhHinhDonVi,
} from "../services/TinhHinhNhanSuTheoDonVi.service";

import {
  taiXuHuongTyLeNghiViec,
  type DongXuHuongTyLeNghiViec,
} from "../services/XuHuongTyLeNghiViec.service";

import {
  taiCoCauNhanSuNghiViec,
  type DongCoCauNghiViec,
} from "../services/CoCauNhanSuNghiViec.service";

import {
  taiCoCauNhanSuHienTai,
  type KetQuaCoCauNhanSuHienTai,
} from "../services/CoCauNhanSuHienTai.service";

import StaffingHeader from "../components/StaffingHeader";
import StaffingFilterBar from "../components/StaffingFilterBar";
import HeadcountSummary from "../components/HeadcountSummary";
import HeadcountTrend from "../components/HeadcountTrend";
import DiemNongNguonLuc from "../components/DiemNongNguonLuc";
import XuHuongTyLeNghiViec from "../components/XuHuongTyLeNghiViec";
import HeadcountAttritionStructure from "../components/HeadcountAttritionStructure";
import PhanTichNghiViecTheoNhom from "../components/PhanTichNghiViecTheoNhom";
import CoCauNhanSuHienTai from "../components/CoCauNhanSuHienTai";
import TinhHinhNhanSuTheoDonVi from "../components/TinhHinhNhanSuTheoDonVi";
import HeadcountGroupControl from "../components/HeadcountGroupControl";

type PageHrKpi = Awaited<ReturnType<typeof loadPageHrKpi>>;

// Bao ve bang Diem nong de loi render khong lam trang ca Dashboard
class BaoVeDiemNong extends Component<
  { children: ReactNode; resetKey: string },
  { loi: string | null }
> {
  state: { loi: string | null } = { loi: null };

  static getDerivedStateFromError(error: Error) {
    return {
      loi: error.message || "Lỗi hiển thị bảng Điểm nóng",
    };
  }

  componentDidUpdate(
    prevProps: Readonly<{ children: ReactNode; resetKey: string }>
  ) {
    if (
      prevProps.resetKey !== this.props.resetKey &&
      this.state.loi !== null
    ) {
      this.setState({ loi: null });
    }
  }

  render() {
    if (this.state.loi) {
      return (
        <div
          role="alert"
          style={{
            padding: 12,
            fontSize: 12,
            color: "#b91c1c",
          }}
        >
          Bảng Điểm nóng gặp lỗi hiển thị: {this.state.loi}

          <button
            type="button"
            onClick={() => this.setState({ loi: null })}
            style={{
              display: "block",
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            Thử tải lại bảng
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 5 DIMENSION - DIEM NONG NGUON LUC
const DIM_DIEM_NONG: NhomDiemNong[] = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
];

export default function HeadcountPage() {
  // 1. BO LOC DUNG CHUNG
  
const [filters, setFilters] = useState<PageHrFilters>({
  ...defaultPageHrFilters,
  month: null,
});


  // 2. KPI POWER BI
  const [kpi, setKpi] = useState<PageHrKpi | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // 3. XU HUONG NHAN SU POWER BI
  const [trendData, setTrendData] =
    useState<PageHrTrendPoint[]>([]);

  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] =
    useState<string | null>(null);

  // 4. XU HUONG TY LE NGHI VIEC - POWER BI
  const [
    duLieuXuHuongTyLeNghiViec,
    setDuLieuXuHuongTyLeNghiViec,
  ] = useState<DongXuHuongTyLeNghiViec[]>([]);

  const [
    xuHuongTyLeNghiViecLoading,
    setXuHuongTyLeNghiViecLoading,
  ] = useState(true);

  const [
    xuHuongTyLeNghiViecError,
    setXuHuongTyLeNghiViecError,
  ] = useState<string | null>(null);

  // 4B. CO CAU NHAN SU NGHI VIEC - 10 DIMENSION
  const [nhomCoCauNghiViec, setNhomCoCauNghiViec] =
    useState<string>("Miền");

  const [duLieuCoCauNghiViec, setDuLieuCoCauNghiViec] =
    useState<DongCoCauNghiViec[]>([]);

  const [coCauNghiViecLoading, setCoCauNghiViecLoading] =
    useState(true);

  const [coCauNghiViecError, setCoCauNghiViecError] =
    useState<string | null>(null);

  // 4C. CO CAU NHAN SU HIEN TAI - 10 DIMENSION
  const [nhomCoCauHienTai, setNhomCoCauHienTai] =
    useState<string>("Miền");

  const [duLieuCoCauHienTai, setDuLieuCoCauHienTai] =
    useState<KetQuaCoCauNhanSuHienTai>({
      data: [],
      total: null,
    });

  const [coCauHienTaiLoading, setCoCauHienTaiLoading] =
    useState(true);

  const [coCauHienTaiError, setCoCauHienTaiError] =
    useState<string | null>(null);

  // 5. DIEM NONG NGUON LUC - 5 DIMENSION
  const [nhomDiemNong, setNhomDiemNong] =
    useState<NhomDiemNong[]>(["Miền"]);

  const [duLieuDiemNong, setDuLieuDiemNong] =
    useState<DongDiemNong[]>([]);

  const [diemNongLoading, setDiemNongLoading] = useState(true);
  const [diemNongError, setDiemNongError] =
    useState<string | null>(null);

  // 6. PHAN TICH NGHI VIEC - 7 DIMENSION
  const [
    nhomPhanTichNghiViec,
    setNhomPhanTichNghiViec,
  ] = useState<string[]>(["Miền"]);

  const [
    duLieuPhanTichNghiViec,
    setDuLieuPhanTichNghiViec,
  ] = useState<DongPhanTichNghiViec[]>([]);

  const [
    phanTichNghiViecLoading,
    setPhanTichNghiViecLoading,
  ] = useState(true);

  const [
    phanTichNghiViecError,
    setPhanTichNghiViecError,
  ] = useState<string | null>(null);

  // 7. TINH HINH NHAN SU THEO DON VI - 7 DIMENSION
  const [nhomTinhHinhDonVi, setNhomTinhHinhDonVi] =
    useState<string[]>(["Miền"]);

  const [duLieuTinhHinhDonVi, setDuLieuTinhHinhDonVi] =
    useState<DongTinhHinhDonVi[]>([]);

  const [tinhHinhDonViLoading, setTinhHinhDonViLoading] =
    useState(true);

  const [tinhHinhDonViError, setTinhHinhDonViError] =
    useState<string | null>(null);

  // 8. LAY KPI TU POWER BI
  useEffect(() => {
    let active = true;

    setKpiLoading(true);
    setKpiError(null);
    setKpi(null);

    loadPageHrKpi(filters)
      .then((data) => {
        if (!active) return;

        setKpi(data);
        setKpiError(null);
        setKpiLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setKpiError(
          error instanceof Error ? error.message : String(error)
        );
        setKpiLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  // 9. LAY XU HUONG NHAN SU TU POWER BI
  useEffect(() => {
    let active = true;

    setTrendLoading(true);
    setTrendError(null);
    setTrendData([]);

    loadPageHrTrend(filters)
      .then((data) => {
        if (!active) return;

        setTrendData(data);
        setTrendError(null);
        setTrendLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setTrendError(
          error instanceof Error ? error.message : String(error)
        );
        setTrendLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  // 10. LAY DIEM NONG NGUON LUC TU POWER BI
  useEffect(() => {
    let active = true;

    setDiemNongLoading(true);
    setDiemNongError(null);
    setDuLieuDiemNong([]);

    taiDuLieuDiemNong(filters, nhomDiemNong)
      .then((data) => {
        if (!active) return;

        setDuLieuDiemNong(data);
        setDiemNongError(null);
        setDiemNongLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuDiemNong([]);
        setDiemNongError(
          error instanceof Error ? error.message : String(error)
        );
        setDiemNongLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, nhomDiemNong]);

  // 11. LAY PHAN TICH NGHI VIEC TU POWER BI
  useEffect(() => {
    let active = true;

    setPhanTichNghiViecLoading(true);
    setPhanTichNghiViecError(null);
    setDuLieuPhanTichNghiViec([]);

    taiPhanTichNghiViecTheoNhom(
      filters,
      nhomPhanTichNghiViec
    )
      .then((data) => {
        if (!active) return;

        setDuLieuPhanTichNghiViec(data);
        setPhanTichNghiViecError(null);
        setPhanTichNghiViecLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuPhanTichNghiViec([]);
        setPhanTichNghiViecError(
          error instanceof Error ? error.message : String(error)
        );
        setPhanTichNghiViecLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, nhomPhanTichNghiViec]);

  // 12. LAY TINH HINH NHAN SU THEO DON VI TU POWER BI
  useEffect(() => {
    let active = true;

    setTinhHinhDonViLoading(true);
    setTinhHinhDonViError(null);
    setDuLieuTinhHinhDonVi([]);

    taiTinhHinhNhanSuTheoDonVi(
      filters,
      nhomTinhHinhDonVi
    )
      .then((data) => {
        if (!active) return;

        setDuLieuTinhHinhDonVi(data);
        setTinhHinhDonViError(null);
        setTinhHinhDonViLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuTinhHinhDonVi([]);
        setTinhHinhDonViError(
          error instanceof Error ? error.message : String(error)
        );
        setTinhHinhDonViLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, nhomTinhHinhDonVi]);

  // 13. LAY XU HUONG TY LE NGHI VIEC TU POWER BI
  useEffect(() => {
    let active = true;

    setXuHuongTyLeNghiViecLoading(true);
    setXuHuongTyLeNghiViecError(null);
    setDuLieuXuHuongTyLeNghiViec([]);

    taiXuHuongTyLeNghiViec(filters)
      .then((data) => {
        if (!active) return;

        setDuLieuXuHuongTyLeNghiViec(data);
        setXuHuongTyLeNghiViecError(null);
        setXuHuongTyLeNghiViecLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuXuHuongTyLeNghiViec([]);
        setXuHuongTyLeNghiViecError(
          error instanceof Error ? error.message : String(error)
        );
        setXuHuongTyLeNghiViecLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  // 13B. LAY CO CAU NHAN SU NGHI VIEC TU POWER BI
  useEffect(() => {
    let active = true;

    setCoCauNghiViecLoading(true);
    setCoCauNghiViecError(null);
    setDuLieuCoCauNghiViec([]);

    taiCoCauNhanSuNghiViec(filters, nhomCoCauNghiViec)
      .then((data) => {
        if (!active) return;

        setDuLieuCoCauNghiViec(data);
        setCoCauNghiViecError(null);
        setCoCauNghiViecLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuCoCauNghiViec([]);
        setCoCauNghiViecError(
          error instanceof Error ? error.message : String(error)
        );
        setCoCauNghiViecLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, nhomCoCauNghiViec]);

  // 13C. LAY CO CAU NHAN SU HIEN TAI TU POWER BI
  useEffect(() => {
    let active = true;

    setCoCauHienTaiLoading(true);
    setCoCauHienTaiError(null);
    setDuLieuCoCauHienTai({ data: [], total: null });

    taiCoCauNhanSuHienTai(filters, nhomCoCauHienTai)
      .then((result) => {
        if (!active) return;

        setDuLieuCoCauHienTai(result);
        setCoCauHienTaiError(null);
        setCoCauHienTaiLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setDuLieuCoCauHienTai({ data: [], total: null });
        setCoCauHienTaiError(
          error instanceof Error ? error.message : String(error)
        );
        setCoCauHienTaiLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, nhomCoCauHienTai]);

  // 14. GIAO DIEN DASHBOARD
  return (
    <main
      style={{
        padding: 0,
        background: "#f3f7fc",
        minHeight: "100vh",
        color: "#153b73",
      }}
    >
      <StaffingHeader />

      {/* 9 BO LOC CHUNG */}
      <StaffingFilterBar
        filters={filters}
        onChange={setFilters}
      />

      {/* HANG 1: KPI - TREND - DIEM NONG */}
      <section
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns:
            window.innerWidth >= 1200
              ? "minmax(0, 2.5fr) minmax(0, 4fr) minmax(0, 3.5fr)"
              : "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* KPI HEADCOUNT */}
        <HeadcountSummary
          kpi={kpi}
          loading={kpiLoading}
          error={kpiError}
          year={filters.year}
          month={filters.month}
        />

        {/* XU HUONG NHAN SU */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe5f1",
            borderRadius: 10,
            padding: 16,
            minHeight: 340,
            minWidth: 0,
          }}
        >
          <h3 style={{ fontSize: 13, margin: 0 }}>
            XU HƯỚNG NHÂN SỰ & BIẾN ĐỘNG
          </h3>

          <HeadcountTrend
            data={trendData}
            loading={trendLoading}
            error={trendError}
          />
        </div>

        {/* DIEM NONG NGUON LUC */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe5f1",
            borderRadius: 10,
            padding: 16,
            height: 420,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <h3
              style={{
                fontSize: 13,
                margin: 0,
                flexShrink: 0,
              }}
            >
              ĐIỂM NÓNG NGUỒN LỰC
            </h3>

            <div style={{ minWidth: 0, flex: 1 }}>
              <HeadcountGroupControl
                variant="tabs"
                preset="hotspots"
                multiSelect
                selectedGroups={nhomDiemNong}
                onMultiChange={(values) => {
                  if (!Array.isArray(values)) return;

                  const hopLe = DIM_DIEM_NONG.filter(
                    (dim) => values.includes(dim)
                  );

                  if (hopLe.length > 0) {
                    setNhomDiemNong(hopLe);
                  }
                }}
              />
            </div>
          </div>

          {/* BANG DIEM NONG POWER BI */}
          <BaoVeDiemNong
            resetKey={[
              filters.year,
              filters.month,
              ...nhomDiemNong,
            ].join("|")}
          >
            <DiemNongNguonLuc
              groups={nhomDiemNong}
              data={duLieuDiemNong}
              loading={diemNongLoading}
              error={diemNongError}
            />
          </BaoVeDiemNong>
        </div>
      </section>

      {/* HANG 2: PHAN TICH NGHI VIEC */}
      <section
        style={{
          padding: "0 20px 20px",
          display: "grid",
          gridTemplateColumns:
            window.innerWidth >= 1200
              ? "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)"
              : "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* XU HUONG TY LE NGHI VIEC */}
        <div style={row2CardStyle}>
          <h3 style={{ fontSize: 13, margin: 0 }}>
            XU HƯỚNG TỶ LỆ NGHỈ VIỆC
          </h3>

          <XuHuongTyLeNghiViec
            data={duLieuXuHuongTyLeNghiViec}
            year={filters.year}
            month={filters.month}
            loading={xuHuongTyLeNghiViecLoading}
            error={xuHuongTyLeNghiViecError}
          />
        </div>

        {/* CO CAU NHAN SU NGHI VIEC */}
        <div style={row2CardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <h3 style={{ fontSize: 13, margin: 0 }}>
              CƠ CẤU NHÂN SỰ NGHỈ VIỆC
            </h3>
            <HeadcountGroupControl
              variant="select"
              onChange={setNhomCoCauNghiViec}
            />
          </div>

          <HeadcountAttritionStructure
            dimension={nhomCoCauNghiViec}
            data={duLieuCoCauNghiViec}
            loading={coCauNghiViecLoading}
            error={coCauNghiViecError}
          />
        </div>

        {/* PHAN TICH NGHI VIEC THEO NHOM */}
        <div style={row2CardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h3 style={{ fontSize: 13, margin: 0 }}>
              PHÂN TÍCH NGHỈ VIỆC THEO NHÓM
            </h3>

            <div
              style={{
                width: "min(100%, 654px)",
                marginLeft: "auto",
                minWidth: 0,
              }}
            >
              <HeadcountGroupControl
                variant="tabs"
                multiSelect
                selectedGroups={nhomPhanTichNghiViec}
                onMultiChange={setNhomPhanTichNghiViec}
              />
            </div>
          </div>

          {/* PHAN TICH NGHI VIEC - POWER BI */}
          <PhanTichNghiViecTheoNhom
            groups={nhomPhanTichNghiViec}
            data={duLieuPhanTichNghiViec}
            year={filters.year}
            month={filters.month}
            loading={phanTichNghiViecLoading}
            error={phanTichNghiViecError}
          />
        </div>
      </section>

      {/* HANG 3: CO CAU VA TINH HINH NHAN SU */}
      <section
        style={{
          padding: "0 20px 20px",
          display: "grid",
          gridTemplateColumns:
            window.innerWidth >= 1200
              ? "minmax(0, 1fr) minmax(0, 3fr)"
              : "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* CO CAU NHAN SU HIEN TAI */}
        <div style={row2CardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <h3 style={{ fontSize: 13, margin: 0 }}>
              CƠ CẤU NHÂN SỰ HIỆN TẠI
            </h3>
            <HeadcountGroupControl
              variant="select"
              onChange={setNhomCoCauHienTai}
            />
          </div>

          <CoCauNhanSuHienTai
            dimension={nhomCoCauHienTai}
            data={duLieuCoCauHienTai.data}
            total={duLieuCoCauHienTai.total}
            loading={coCauHienTaiLoading}
            error={coCauHienTaiError}
          />
        </div>

        {/* TINH HINH NHAN SU THEO DON VI */}
        <div style={row2CardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h3 style={{ fontSize: 13, margin: 0 }}>
              TÌNH HÌNH NHÂN SỰ THEO ĐƠN VỊ
            </h3>

            <div
              style={{
                width: "min(100%, 654px)",
                marginLeft: "auto",
                minWidth: 0,
              }}
            >
              <HeadcountGroupControl
                variant="tabs"
                multiSelect
                selectedGroups={nhomTinhHinhDonVi}
                onMultiChange={setNhomTinhHinhDonVi}
              />
            </div>
          </div>

          {/* BANG TINH HINH NHAN SU - POWER BI */}
          <TinhHinhNhanSuTheoDonVi
            groups={nhomTinhHinhDonVi}
            data={duLieuTinhHinhDonVi}
            year={filters.year}
            month={filters.month}
            loading={tinhHinhDonViLoading}
            error={tinhHinhDonViError}
          />
        </div>
      </section>
    </main>
  );
}

const row2CardStyle = {
  background: "#ffffff",
  border: "1px solid #dbe5f1",
  borderRadius: 10,
  padding: 16,
  minHeight: 320,
  minWidth: 0,
};
