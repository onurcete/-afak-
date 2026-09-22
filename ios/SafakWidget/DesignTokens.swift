// ios/SafakWidget/DesignTokens.swift
// UI_SPEC.md tasarım token'larının Swift / SwiftUI karşılığı.

import SwiftUI

struct SafakColors {
    static let darkBg = Color(hex: "#0A1020")
    static let darkBgBottom = Color(hex: "#0E1830")
    static let ink = Color(hex: "#F3F1EA")
    static let mut = Color(hex: "#9DA8BD")
    static let dawn = Color(hex: "#FFD6B0")
    static let plateBg = Color(hex: "#F6F6F1")
    static let plateInk = Color(hex: "#101216")
    static let plateBand = Color(hex: "#1F3FA8")
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted))
        var int: UInt64 = 0
        scanner.scanHexInt64(&int)
        let r, g, b: UInt64
        switch hex.count {
        case 7: // #RRGGBB
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}
