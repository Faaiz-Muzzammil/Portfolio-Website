import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Faaiz Muzzammil — Full-stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#E8EBE5";
const INK = "#11161A";
const INK_3 = "#6C757C";
const ACCENT = "#5A43D2";
const SIGNAL = "#D9512A";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: PAPER,
                    padding: "72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ width: "48px", height: "2px", background: SIGNAL }} />
                    <span
                        style={{
                            color: INK_3,
                            fontSize: "21px",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                        }}
                    >
                        Islamabad, Pakistan
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                        style={{
                            fontSize: "86px",
                            fontWeight: 700,
                            color: INK,
                            letterSpacing: "-0.045em",
                            lineHeight: 1,
                        }}
                    >
                        I build the thing,
                    </span>
                    <span
                        style={{
                            display: "flex",
                            fontSize: "86px",
                            fontWeight: 700,
                            color: INK,
                            letterSpacing: "-0.045em",
                            lineHeight: 1,
                        }}
                    >
                        then I&nbsp;
                        <span style={{ color: ACCENT, fontWeight: 400 }}>get it used.</span>
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid rgba(17,22,26,0.14)",
                        paddingTop: "28px",
                    }}
                >
                    <span style={{ color: INK, fontSize: "28px", fontWeight: 600 }}>
                        Faaiz Muzzammil
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "9px", height: "9px", background: SIGNAL }} />
                        <span
                            style={{
                                color: INK_3,
                                fontSize: "20px",
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                            }}
                        >
                            Open to work
                        </span>
                    </div>
                </div>
            </div>
        ),
        { ...size },
    );
}
