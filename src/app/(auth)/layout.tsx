export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Domain watermark */}
      <div style={{
        position: "absolute", bottom: 24,
        fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em",
      }}>
        tarjetacliente.vip
      </div>
      {children}
    </div>
  );
}
