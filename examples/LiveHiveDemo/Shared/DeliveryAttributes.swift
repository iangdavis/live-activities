import ActivityKit
import Foundation

public struct DeliveryAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var status: String
        public var eta: Int

        public init(status: String, eta: Int) {
            self.status = status
            self.eta = eta
        }
    }

    public init() {}
}
