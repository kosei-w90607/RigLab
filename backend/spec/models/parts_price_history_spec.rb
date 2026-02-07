require "rails_helper"

RSpec.describe PartsPriceHistory, type: :model do
  describe "validations" do
    subject { build(:parts_price_history) }

    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "requires part_id" do
      subject.part_id = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:part_id]).to be_present
    end

    it "requires part_type" do
      subject.part_type = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:part_type]).to be_present
    end

    it "requires part_type to be a valid value" do
      subject.part_type = "invalid"
      expect(subject).not_to be_valid
      expect(subject.errors[:part_type]).to be_present
    end

    it "requires price" do
      subject.price = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:price]).to be_present
    end

    it "requires price to be a positive integer" do
      subject.price = 0
      expect(subject).not_to be_valid
      expect(subject.errors[:price]).to be_present
    end

    it "rejects non-integer price" do
      subject.price = 100.5
      expect(subject).not_to be_valid
      expect(subject.errors[:price]).to be_present
    end

    it "requires source" do
      subject.source = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:source]).to be_present
    end

    it "requires source to be a valid value" do
      subject.source = "ebay"
      expect(subject).not_to be_valid
      expect(subject.errors[:source]).to be_present
    end

    it "requires fetched_at" do
      subject.fetched_at = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:fetched_at]).to be_present
    end
  end

  describe "constants" do
    it "defines VALID_PART_TYPES" do
      expect(PartsPriceHistory::VALID_PART_TYPES).to eq(%w[cpu gpu memory storage os motherboard psu case])
    end

    it "defines VALID_SOURCES" do
      expect(PartsPriceHistory::VALID_SOURCES).to eq(%w[rakuten amazon manual])
    end
  end

  describe "scopes" do
    describe ".for_part" do
      it "filters by part_type and part_id" do
        matching = create(:parts_price_history, part_type: "cpu", part_id: 1)
        create(:parts_price_history, part_type: "gpu", part_id: 1)
        create(:parts_price_history, part_type: "cpu", part_id: 2)

        expect(PartsPriceHistory.for_part("cpu", 1)).to eq([matching])
      end
    end

    describe ".recent" do
      it "filters records within the given number of days" do
        recent_record = create(:parts_price_history, fetched_at: 10.days.ago)
        create(:parts_price_history, fetched_at: 60.days.ago)

        expect(PartsPriceHistory.recent(30)).to eq([recent_record])
      end

      it "defaults to 30 days" do
        recent_record = create(:parts_price_history, fetched_at: 25.days.ago)
        create(:parts_price_history, fetched_at: 35.days.ago)

        expect(PartsPriceHistory.recent).to eq([recent_record])
      end
    end

    describe ".by_source" do
      it "filters by source" do
        rakuten = create(:parts_price_history, source: "rakuten")
        create(:parts_price_history, source: "amazon")

        expect(PartsPriceHistory.by_source("rakuten")).to eq([rakuten])
      end
    end

    describe ".latest_per_day" do
      include ActiveSupport::Testing::TimeHelpers

      it "returns the latest record per day" do
        travel_to Time.zone.parse("2025-01-15 10:00:00") do
          create(:parts_price_history, fetched_at: Time.zone.parse("2025-01-15 08:00:00"))
          later_today = create(:parts_price_history, fetched_at: Time.zone.parse("2025-01-15 12:00:00"))
          yesterday = create(:parts_price_history, fetched_at: Time.zone.parse("2025-01-14 09:00:00"))

          result = PartsPriceHistory.latest_per_day
          expect(result).to contain_exactly(later_today, yesterday)
        end
      end
    end
  end
end
