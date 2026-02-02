# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# CPUs
cpus = [
  # Intel 13th/14th Gen (LGA1700)
  { name: "Intel Core i5-13400F", price: 28980, maker: "Intel", socket: "LGA1700", tdp: 65, memory_type: "DDR5", specs: { cores: 10, threads: 16, base_clock: 2.5, boost_clock: 4.6 } },
  { name: "Intel Core i5-14400F", price: 32980, maker: "Intel", socket: "LGA1700", tdp: 65, memory_type: "DDR5", specs: { cores: 10, threads: 16, base_clock: 2.5, boost_clock: 4.7 } },
  { name: "Intel Core i7-13700F", price: 52980, maker: "Intel", socket: "LGA1700", tdp: 65, memory_type: "DDR5", specs: { cores: 16, threads: 24, base_clock: 2.1, boost_clock: 5.2 } },
  { name: "Intel Core i7-14700F", price: 56980, maker: "Intel", socket: "LGA1700", tdp: 65, memory_type: "DDR5", specs: { cores: 20, threads: 28, base_clock: 2.1, boost_clock: 5.4 } },
  { name: "Intel Core i9-14900K", price: 89980, maker: "Intel", socket: "LGA1700", tdp: 125, memory_type: "DDR5", specs: { cores: 24, threads: 32, base_clock: 3.2, boost_clock: 6.0 } },
  # Intel 15th Gen Arrow Lake (LGA1851)
  { name: "Intel Core Ultra 5 245K", price: 42980, maker: "Intel", socket: "LGA1851", tdp: 125, memory_type: "DDR5", specs: { cores: 14, threads: 14, base_clock: 4.2, boost_clock: 5.2 } },
  { name: "Intel Core Ultra 7 265K", price: 62980, maker: "Intel", socket: "LGA1851", tdp: 125, memory_type: "DDR5", specs: { cores: 20, threads: 20, base_clock: 3.9, boost_clock: 5.5 } },
  { name: "Intel Core Ultra 9 285K", price: 89980, maker: "Intel", socket: "LGA1851", tdp: 125, memory_type: "DDR5", specs: { cores: 24, threads: 24, base_clock: 3.7, boost_clock: 5.7 } },
  # AMD Ryzen 7000 Series (AM5)
  { name: "AMD Ryzen 5 7600", price: 29980, maker: "AMD", socket: "AM5", tdp: 65, memory_type: "DDR5", specs: { cores: 6, threads: 12, base_clock: 3.8, boost_clock: 5.1 } },
  { name: "AMD Ryzen 7 7700X", price: 49980, maker: "AMD", socket: "AM5", tdp: 105, memory_type: "DDR5", specs: { cores: 8, threads: 16, base_clock: 4.5, boost_clock: 5.4 } },
  { name: "AMD Ryzen 9 7900X", price: 69980, maker: "AMD", socket: "AM5", tdp: 170, memory_type: "DDR5", specs: { cores: 12, threads: 24, base_clock: 4.7, boost_clock: 5.6 } },
  { name: "AMD Ryzen 9 7950X", price: 89980, maker: "AMD", socket: "AM5", tdp: 170, memory_type: "DDR5", specs: { cores: 16, threads: 32, base_clock: 4.5, boost_clock: 5.7 } },
  # AMD Ryzen 9000 Series Zen 5 (AM5)
  { name: "AMD Ryzen 5 9600X", price: 36980, maker: "AMD", socket: "AM5", tdp: 65, memory_type: "DDR5", specs: { cores: 6, threads: 12, base_clock: 3.9, boost_clock: 5.4 } },
  { name: "AMD Ryzen 7 9700X", price: 52980, maker: "AMD", socket: "AM5", tdp: 65, memory_type: "DDR5", specs: { cores: 8, threads: 16, base_clock: 3.8, boost_clock: 5.5 } },
  { name: "AMD Ryzen 9 9900X", price: 72980, maker: "AMD", socket: "AM5", tdp: 120, memory_type: "DDR5", specs: { cores: 12, threads: 24, base_clock: 4.4, boost_clock: 5.6 } },
  { name: "AMD Ryzen 9 9950X", price: 99980, maker: "AMD", socket: "AM5", tdp: 170, memory_type: "DDR5", specs: { cores: 16, threads: 32, base_clock: 4.3, boost_clock: 5.7 } },
]

cpus.each do |cpu|
  PartsCpu.find_or_create_by!(name: cpu[:name]) do |c|
    c.assign_attributes(cpu)
  end
end
puts "  Created #{PartsCpu.count} CPUs"

# GPUs
gpus = [
  { name: "NVIDIA GeForce RTX 4060", price: 44980, maker: "NVIDIA", tdp: 115, length_mm: 240, specs: { vram: 8, memory_type: "GDDR6" } },
  { name: "NVIDIA GeForce RTX 4060 Ti", price: 59980, maker: "NVIDIA", tdp: 160, length_mm: 240, specs: { vram: 8, memory_type: "GDDR6" } },
  { name: "NVIDIA GeForce RTX 4070", price: 84980, maker: "NVIDIA", tdp: 200, length_mm: 285, specs: { vram: 12, memory_type: "GDDR6X" } },
  { name: "NVIDIA GeForce RTX 4070 Super", price: 94980, maker: "NVIDIA", tdp: 220, length_mm: 305, specs: { vram: 12, memory_type: "GDDR6X" } },
  { name: "NVIDIA GeForce RTX 4070 Ti Super", price: 124980, maker: "NVIDIA", tdp: 285, length_mm: 336, specs: { vram: 16, memory_type: "GDDR6X" } },
  { name: "NVIDIA GeForce RTX 4080 Super", price: 169980, maker: "NVIDIA", tdp: 320, length_mm: 336, specs: { vram: 16, memory_type: "GDDR6X" } },
  { name: "NVIDIA GeForce RTX 4090", price: 298000, maker: "NVIDIA", tdp: 450, length_mm: 336, specs: { vram: 24, memory_type: "GDDR6X" } },
  { name: "AMD Radeon RX 7600", price: 37980, maker: "AMD", tdp: 165, length_mm: 204, specs: { vram: 8, memory_type: "GDDR6" } },
  { name: "AMD Radeon RX 7700 XT", price: 64980, maker: "AMD", tdp: 245, length_mm: 267, specs: { vram: 12, memory_type: "GDDR6" } },
  { name: "AMD Radeon RX 7800 XT", price: 74980, maker: "AMD", tdp: 263, length_mm: 267, specs: { vram: 16, memory_type: "GDDR6" } },
  { name: "AMD Radeon RX 7900 XT", price: 114980, maker: "AMD", tdp: 315, length_mm: 276, specs: { vram: 20, memory_type: "GDDR6" } },
]

gpus.each do |gpu|
  PartsGpu.find_or_create_by!(name: gpu[:name]) do |g|
    g.assign_attributes(gpu)
  end
end
puts "  Created #{PartsGpu.count} GPUs"

# Memories
memories = [
  { name: "Crucial DDR5-4800 16GB (8GBx2)", price: 8980, maker: "Crucial", memory_type: "DDR5", specs: { capacity: 16, speed: 4800, modules: 2 } },
  { name: "Crucial DDR5-5600 32GB (16GBx2)", price: 15980, maker: "Crucial", memory_type: "DDR5", specs: { capacity: 32, speed: 5600, modules: 2 } },
  { name: "G.Skill Trident Z5 DDR5-6000 32GB (16GBx2)", price: 22980, maker: "G.Skill", memory_type: "DDR5", specs: { capacity: 32, speed: 6000, modules: 2 } },
  { name: "G.Skill Trident Z5 DDR5-6400 32GB (16GBx2)", price: 28980, maker: "G.Skill", memory_type: "DDR5", specs: { capacity: 32, speed: 6400, modules: 2 } },
  { name: "Corsair Vengeance DDR5-5600 64GB (32GBx2)", price: 35980, maker: "Corsair", memory_type: "DDR5", specs: { capacity: 64, speed: 5600, modules: 2 } },
  { name: "Crucial DDR4-3200 16GB (8GBx2)", price: 5980, maker: "Crucial", memory_type: "DDR4", specs: { capacity: 16, speed: 3200, modules: 2 } },
  { name: "Crucial DDR4-3200 32GB (16GBx2)", price: 10980, maker: "Crucial", memory_type: "DDR4", specs: { capacity: 32, speed: 3200, modules: 2 } },
]

memories.each do |memory|
  PartsMemory.find_or_create_by!(name: memory[:name]) do |m|
    m.assign_attributes(memory)
  end
end
puts "  Created #{PartsMemory.count} Memories"

# Storages
storages = [
  { name: "Samsung 990 Pro 1TB", price: 15980, maker: "Samsung", specs: { capacity: 1000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 7450, write_speed: 6900 } },
  { name: "Samsung 990 Pro 2TB", price: 24980, maker: "Samsung", specs: { capacity: 2000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 7450, write_speed: 6900 } },
  { name: "WD Black SN850X 1TB", price: 14980, maker: "Western Digital", specs: { capacity: 1000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 7300, write_speed: 6300 } },
  { name: "WD Black SN850X 2TB", price: 23980, maker: "Western Digital", specs: { capacity: 2000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 7300, write_speed: 6600 } },
  { name: "Crucial P3 Plus 1TB", price: 9980, maker: "Crucial", specs: { capacity: 1000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 5000, write_speed: 4200 } },
  { name: "Crucial P3 Plus 2TB", price: 15980, maker: "Crucial", specs: { capacity: 2000, storage_type: "NVMe SSD", interface: "PCIe 4.0 x4", read_speed: 5000, write_speed: 4200 } },
  { name: "Samsung 870 EVO 1TB", price: 11980, maker: "Samsung", specs: { capacity: 1000, storage_type: "SATA SSD", interface: "SATA III", read_speed: 560, write_speed: 530 } },
  { name: "Seagate Barracuda 2TB", price: 8980, maker: "Seagate", specs: { capacity: 2000, storage_type: "HDD", interface: "SATA III", read_speed: 220, write_speed: 220 } },
  { name: "Seagate Barracuda 4TB", price: 12980, maker: "Seagate", specs: { capacity: 4000, storage_type: "HDD", interface: "SATA III", read_speed: 190, write_speed: 190 } },
]

storages.each do |storage|
  PartsStorage.find_or_create_by!(name: storage[:name]) do |s|
    s.assign_attributes(storage)
  end
end
puts "  Created #{PartsStorage.count} Storages"

# Operating Systems
os_list = [
  { name: "Windows 11 Home", price: 19800, maker: "Microsoft", specs: { version: "11 Home" } },
  { name: "Windows 11 Pro", price: 28800, maker: "Microsoft", specs: { version: "11 Pro" } },
  { name: "Ubuntu 24.04 LTS", price: 0, maker: "Canonical", specs: { version: "24.04 LTS" } },
]

os_list.each do |os|
  PartsOs.find_or_create_by!(name: os[:name]) do |o|
    o.assign_attributes(os)
  end
end
puts "  Created #{PartsOs.count} Operating Systems"

# Motherboards
motherboards = [
  # Intel LGA1700 (13th/14th Gen)
  { name: "ASUS ROG STRIX B760-F GAMING WIFI", price: 32980, maker: "ASUS", socket: "LGA1700", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "B760", memory_slots: 4, max_memory: 128, m2_slots: 2 } },
  { name: "ASUS TUF GAMING B760M-PLUS WIFI", price: 22980, maker: "ASUS", socket: "LGA1700", memory_type: "DDR5", form_factor: "mATX", specs: { chipset: "B760", memory_slots: 4, max_memory: 128, m2_slots: 2 } },
  { name: "MSI MAG B760 TOMAHAWK WIFI", price: 28980, maker: "MSI", socket: "LGA1700", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "B760", memory_slots: 4, max_memory: 128, m2_slots: 2 } },
  # Intel LGA1851 (15th Gen Arrow Lake)
  { name: "ASUS ROG MAXIMUS Z890 HERO", price: 89980, maker: "ASUS", socket: "LGA1851", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "Z890", memory_slots: 4, max_memory: 192, m2_slots: 5 } },
  { name: "MSI MEG Z890 ACE", price: 79980, maker: "MSI", socket: "LGA1851", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "Z890", memory_slots: 4, max_memory: 192, m2_slots: 4 } },
  { name: "Gigabyte Z890 AORUS MASTER", price: 69980, maker: "Gigabyte", socket: "LGA1851", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "Z890", memory_slots: 4, max_memory: 192, m2_slots: 4 } },
  { name: "ASUS PRIME Z890-P WIFI", price: 42980, maker: "ASUS", socket: "LGA1851", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "Z890", memory_slots: 4, max_memory: 192, m2_slots: 3 } },
  # AMD AM5
  { name: "ASUS ROG STRIX X670E-E GAMING WIFI", price: 59980, maker: "ASUS", socket: "AM5", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "X670E", memory_slots: 4, max_memory: 128, m2_slots: 4 } },
  { name: "MSI MAG X670E TOMAHAWK WIFI", price: 42980, maker: "MSI", socket: "AM5", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "X670E", memory_slots: 4, max_memory: 128, m2_slots: 4 } },
  { name: "ASUS ROG STRIX B650E-F GAMING WIFI", price: 38980, maker: "ASUS", socket: "AM5", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "B650E", memory_slots: 4, max_memory: 128, m2_slots: 3 } },
  { name: "Gigabyte B650 AORUS ELITE AX", price: 28980, maker: "Gigabyte", socket: "AM5", memory_type: "DDR5", form_factor: "ATX", specs: { chipset: "B650", memory_slots: 4, max_memory: 128, m2_slots: 2 } },
]

motherboards.each do |mb|
  PartsMotherboard.find_or_create_by!(name: mb[:name]) do |m|
    m.assign_attributes(mb)
  end
end
puts "  Created #{PartsMotherboard.count} Motherboards"

# PSUs
psus = [
  { name: "Corsair RM650", price: 12980, maker: "Corsair", wattage: 650, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Corsair RM750", price: 14980, maker: "Corsair", wattage: 750, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Corsair RM850", price: 17980, maker: "Corsair", wattage: 850, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Corsair RM1000", price: 24980, maker: "Corsair", wattage: 1000, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Seasonic FOCUS GX-650", price: 13980, maker: "Seasonic", wattage: 650, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Seasonic FOCUS GX-750", price: 15980, maker: "Seasonic", wattage: 750, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Seasonic FOCUS GX-850", price: 18980, maker: "Seasonic", wattage: 850, form_factor: "ATX", specs: { efficiency: "80+ Gold", modular: "Full" } },
  { name: "Seasonic PRIME TX-1000", price: 39980, maker: "Seasonic", wattage: 1000, form_factor: "ATX", specs: { efficiency: "80+ Titanium", modular: "Full" } },
]

psus.each do |psu|
  PartsPsu.find_or_create_by!(name: psu[:name]) do |p|
    p.assign_attributes(psu)
  end
end
puts "  Created #{PartsPsu.count} PSUs"

# Cases
cases = [
  { name: "NZXT H5 Flow", price: 12980, maker: "NZXT", form_factor: "ATX", max_gpu_length_mm: 365, specs: { max_cpu_cooler_height: 165 } },
  { name: "NZXT H7 Flow", price: 17980, maker: "NZXT", form_factor: "ATX", max_gpu_length_mm: 400, specs: { max_cpu_cooler_height: 185 } },
  { name: "Fractal Design North", price: 19980, maker: "Fractal Design", form_factor: "ATX", max_gpu_length_mm: 355, specs: { max_cpu_cooler_height: 170 } },
  { name: "Fractal Design Torrent", price: 24980, maker: "Fractal Design", form_factor: "ATX", max_gpu_length_mm: 461, specs: { max_cpu_cooler_height: 188 } },
  { name: "Lian Li O11 Dynamic EVO", price: 22980, maker: "Lian Li", form_factor: "ATX", max_gpu_length_mm: 420, specs: { max_cpu_cooler_height: 167 } },
  { name: "Corsair 4000D Airflow", price: 12980, maker: "Corsair", form_factor: "ATX", max_gpu_length_mm: 360, specs: { max_cpu_cooler_height: 170 } },
  { name: "Corsair 5000D Airflow", price: 19980, maker: "Corsair", form_factor: "ATX", max_gpu_length_mm: 400, specs: { max_cpu_cooler_height: 170 } },
]

cases.each do |pc_case|
  PartsCase.find_or_create_by!(name: pc_case[:name]) do |c|
    c.assign_attributes(pc_case)
  end
end
puts "  Created #{PartsCase.count} Cases"

# Presets (PcEntrustSets)
puts "Creating presets..."

# Helper to find parts by name
def find_cpu(name)
  PartsCpu.find_by!(name: name)
end

def find_gpu(name)
  PartsGpu.find_by!(name: name)
end

def find_memory(name)
  PartsMemory.find_by!(name: name)
end

def find_storage(name)
  PartsStorage.find_by!(name: name)
end

def find_os(name)
  PartsOs.find_by!(name: name)
end

def find_motherboard(name)
  PartsMotherboard.find_by!(name: name)
end

def find_psu(name)
  PartsPsu.find_by!(name: name)
end

def find_case(name)
  PartsCase.find_by!(name: name)
end

presets = [
  # ===== エントリー帯 (~10万円) =====
  {
    name: "エントリーゲーミングPC",
    description: "10万円以下でゲームを始めたい方に最適。フルHDで人気タイトルを快適にプレイできます。",
    budget_range: "entry",
    use_case: "gaming",
    cpu: "AMD Ryzen 5 7600",
    gpu: "AMD Radeon RX 7600",
    memory: "Crucial DDR5-4800 16GB (8GBx2)",
    storage1: "Crucial P3 Plus 1TB",
    os: "Windows 11 Home",
    motherboard: "Gigabyte B650 AORUS ELITE AX",
    psu: "Corsair RM650",
    case: "Corsair 4000D Airflow"
  },
  {
    name: "エントリークリエイターPC",
    description: "動画編集やイラスト制作を始めたい方向け。軽めの作業なら快適にこなせます。",
    budget_range: "entry",
    use_case: "creative",
    cpu: "AMD Ryzen 5 7600",
    gpu: "AMD Radeon RX 7600",
    memory: "Crucial DDR5-4800 16GB (8GBx2)",
    storage1: "Crucial P3 Plus 1TB",
    os: "Windows 11 Home",
    motherboard: "Gigabyte B650 AORUS ELITE AX",
    psu: "Corsair RM650",
    case: "Corsair 4000D Airflow"
  },
  {
    name: "エントリーオフィスPC",
    description: "事務作業やWeb閲覧に最適。コストパフォーマンス重視の構成です。",
    budget_range: "entry",
    use_case: "office",
    cpu: "Intel Core i5-13400F",
    gpu: "AMD Radeon RX 7600",
    memory: "Crucial DDR5-4800 16GB (8GBx2)",
    storage1: "Crucial P3 Plus 1TB",
    os: "Windows 11 Home",
    motherboard: "ASUS TUF GAMING B760M-PLUS WIFI",
    psu: "Corsair RM650",
    case: "Corsair 4000D Airflow"
  },

  # ===== ミドル帯 (10~30万円) =====
  {
    name: "ミドルゲーミングPC",
    description: "WQHD高画質でAAAタイトルを快適にプレイ。配信やVRにも対応できる万能構成。",
    budget_range: "middle",
    use_case: "gaming",
    cpu: "Intel Core i7-14700F",
    gpu: "NVIDIA GeForce RTX 4070 Super",
    memory: "Crucial DDR5-5600 32GB (16GBx2)",
    storage1: "Samsung 990 Pro 2TB",
    os: "Windows 11 Home",
    motherboard: "MSI MAG B760 TOMAHAWK WIFI",
    psu: "Corsair RM850",
    case: "NZXT H7 Flow"
  },
  {
    name: "ミドルクリエイターPC",
    description: "4K動画編集や3DCG制作に対応。クリエイティブワークの効率を大幅にアップ。",
    budget_range: "middle",
    use_case: "creative",
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA GeForce RTX 4070",
    memory: "G.Skill Trident Z5 DDR5-6000 32GB (16GBx2)",
    storage1: "Samsung 990 Pro 2TB",
    storage2: "Seagate Barracuda 4TB",
    os: "Windows 11 Pro",
    motherboard: "ASUS ROG STRIX B650E-F GAMING WIFI",
    psu: "Corsair RM850",
    case: "Fractal Design North"
  },
  {
    name: "ミドルオフィスPC",
    description: "マルチタスクやビジネス用途に最適。安定性と性能のバランスが取れた構成。",
    budget_range: "middle",
    use_case: "office",
    cpu: "Intel Core i7-13700F",
    gpu: "NVIDIA GeForce RTX 4060",
    memory: "Crucial DDR5-5600 32GB (16GBx2)",
    storage1: "Samsung 990 Pro 1TB",
    storage2: "Seagate Barracuda 2TB",
    os: "Windows 11 Pro",
    motherboard: "ASUS ROG STRIX B760-F GAMING WIFI",
    psu: "Corsair RM750",
    case: "NZXT H5 Flow"
  },

  # ===== ハイエンド帯 (30万円~) =====
  {
    name: "ハイエンドゲーミングPC",
    description: "4K最高画質でどんなゲームも快適。競技シーンでも活躍できる最強スペック。",
    budget_range: "high",
    use_case: "gaming",
    cpu: "Intel Core i9-14900K",
    gpu: "NVIDIA GeForce RTX 4080 Super",
    memory: "G.Skill Trident Z5 DDR5-6400 32GB (16GBx2)",
    storage1: "Samsung 990 Pro 2TB",
    storage2: "Samsung 990 Pro 2TB",
    os: "Windows 11 Pro",
    motherboard: "ASUS ROG STRIX B760-F GAMING WIFI",
    psu: "Corsair RM1000",
    case: "Lian Li O11 Dynamic EVO"
  },
  {
    name: "ハイエンドクリエイターPC",
    description: "8K動画編集、大規模3DCG、AIワークロードに対応。プロフェッショナル向け構成。",
    budget_range: "high",
    use_case: "creative",
    cpu: "AMD Ryzen 9 7950X",
    gpu: "NVIDIA GeForce RTX 4090",
    memory: "Corsair Vengeance DDR5-5600 64GB (32GBx2)",
    storage1: "Samsung 990 Pro 2TB",
    storage2: "Samsung 990 Pro 2TB",
    storage3: "Seagate Barracuda 4TB",
    os: "Windows 11 Pro",
    motherboard: "ASUS ROG STRIX X670E-E GAMING WIFI",
    psu: "Seasonic PRIME TX-1000",
    case: "Fractal Design Torrent"
  },
  {
    name: "ハイエンドワークステーション",
    description: "ビジネス向け最高峰。複雑な計算処理やシミュレーションも余裕でこなします。",
    budget_range: "high",
    use_case: "office",
    cpu: "AMD Ryzen 9 7900X",
    gpu: "NVIDIA GeForce RTX 4070 Ti Super",
    memory: "G.Skill Trident Z5 DDR5-6000 32GB (16GBx2)",
    storage1: "Samsung 990 Pro 2TB",
    storage2: "Seagate Barracuda 4TB",
    os: "Windows 11 Pro",
    motherboard: "MSI MAG X670E TOMAHAWK WIFI",
    psu: "Seasonic FOCUS GX-850",
    case: "Corsair 5000D Airflow"
  }
]

presets.each do |preset_data|
  preset = PcEntrustSet.find_or_initialize_by(name: preset_data[:name])

  preset.description = preset_data[:description]
  preset.budget_range = preset_data[:budget_range]
  preset.use_case = preset_data[:use_case]
  preset.cpu = find_cpu(preset_data[:cpu])
  preset.gpu = find_gpu(preset_data[:gpu])
  preset.memory = find_memory(preset_data[:memory])
  preset.storage1 = find_storage(preset_data[:storage1])
  preset.storage2 = preset_data[:storage2] ? find_storage(preset_data[:storage2]) : nil
  preset.storage3 = preset_data[:storage3] ? find_storage(preset_data[:storage3]) : nil
  preset.os = find_os(preset_data[:os])
  preset.motherboard = find_motherboard(preset_data[:motherboard])
  preset.psu = find_psu(preset_data[:psu])
  preset.case = find_case(preset_data[:case])

  preset.save!
end

puts "  Created #{PcEntrustSet.count} Presets"

puts "Seeding completed!"
