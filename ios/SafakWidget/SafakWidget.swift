// ios/SafakWidget/SafakWidget.swift
// AGENT.md: WidgetKit ile Swift'te yazılır. ios/SafakWidget/ altında ayrı bir hedef olarak durur.
// UI_SPEC.md: Plaka bileşeni, şafak rengi, App Group veri okuyucusu.

import WidgetKit
import SwiftUI

struct SafakEntry: TimelineEntry {
    let date: Date
    let remainingDays: Int
    let heroState: String // "far", "plate", "done"
    let plateNumber: Int?
    let cityName: String?
    let progressPercent: Int
}

struct SafakProvider: TimelineProvider {
    func placeholder(in context: Context) -> SafakEntry {
        SafakEntry(
            date: Date(),
            remainingDays: 34,
            heroState: "plate",
            plateNumber: 34,
            cityName: "İstanbul",
            progressPercent: 65
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SafakEntry) -> Void) {
        completion(loadSafakData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SafakEntry>) -> Void) {
        let entry = loadSafakData()
        // Günde bir veya birkaç saatte bir yenileme (iOS widget kısıtları)
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadSafakData() -> SafakEntry {
        let suiteName = "group.com.safakplus.app"
        guard let defaults = UserDefaults(suiteName: suiteName),
              let jsonString = defaults.string(forKey: "safak_widget_data"),
              let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return SafakEntry(
                date: Date(),
                remainingDays: 81,
                heroState: "plate",
                plateNumber: 81,
                cityName: "Düzce",
                progressPercent: 50
            )
        }

        let remaining = json["remainingDays"] as? Int ?? 0
        let state = json["heroState"] as? String ?? "plate"
        let plate = json["plateNumber"] as? Int
        let city = json["cityName"] as? String
        let progress = json["progressPercent"] as? Int ?? 0

        return SafakEntry(
            date: Date(),
            remainingDays: remaining,
            heroState: state,
            plateNumber: plate,
            cityName: city,
            progressPercent: progress
        )
    }
}

struct SafakWidgetEntryView: View {
    var entry: SafakProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [SafakColors.darkBg, SafakColors.darkBgBottom],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(spacing: 6) {
                if entry.heroState == "done" {
                    Text("TEZKERECİ")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(SafakColors.dawn)
                    Text("Hayırlı Olsun!")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(SafakColors.ink)
                } else if entry.heroState == "plate", let plate = entry.plateNumber, let city = entry.cityName {
                    HStack(spacing: 8) {
                        // Plaka Görünümü
                        HStack(spacing: 3) {
                            Text("TR")
                                .font(.system(size: 10, weight: .heavy))
                                .foregroundColor(.white)
                                .frame(width: 16, height: 26)
                                .background(SafakColors.plateBand)

                            Text(String(format: "%02d", plate))
                                .font(.system(size: 20, weight: .bold, design: .monospaced))
                                .foregroundColor(SafakColors.plateInk)
                                .padding(.trailing, 5)
                        }
                        .background(SafakColors.plateBg)
                        .cornerRadius(4)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(Color.black, lineWidth: 1)
                        )

                        Text(city)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(SafakColors.ink)
                            .lineLimit(1)
                    }

                    Text("\(entry.remainingDays) GÜN KALDI")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(SafakColors.mut)
                } else {
                    Text("\(entry.remainingDays)")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(SafakColors.dawn)
                    Text("GÜN KALDI")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(SafakColors.mut)
                }

                // İlerleme yüzdesi
                Text("%\(entry.progressPercent) tamamlandı")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(SafakColors.mut.opacity(0.8))
            }
            .padding(12)
        }
    }
}

@main
struct SafakWidget: Widget {
    let kind: String = "SafakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SafakProvider()) { entry in
            SafakWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Şafak+")
        .description("Tezkereye kalan süreyi ve şafak ilinizi gösterir.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
