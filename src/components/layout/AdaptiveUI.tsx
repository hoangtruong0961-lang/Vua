
import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../context/ThemeContext';

interface AdaptiveUIProps {
  /** Giao diện dành cho máy tính */
  desktop: React.ReactNode;
  /** Giao diện dành cho điện thoại */
  mobile: React.ReactNode;
  /** Cho phép ghi đè breakpoint nếu cần (mặc định 768px) */
  breakpoint?: number;
}

/**
 * AdaptiveUI là thành phần bắt buộc người dùng phải cung cấp cả hai giao diện.
 * Điều này đảm bảo khi cập nhật tính năng mới, lập trình viên không quên cập nhật bản di động.
 * Đồng thời tự động chọn dựa trên cấu hình interfaceMode của hệ thống.
 */
const AdaptiveUI: React.FC<AdaptiveUIProps> = ({ desktop, mobile, breakpoint }) => {
  const { isMobile } = useResponsive(breakpoint);
  const { interfaceMode } = useTheme();

  let showMobile = isMobile;
  if (interfaceMode === 'mobile') {
    showMobile = true;
  } else if (interfaceMode === 'pc') {
    showMobile = false;
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {showMobile ? mobile : desktop}
    </div>
  );
};

export default AdaptiveUI;
