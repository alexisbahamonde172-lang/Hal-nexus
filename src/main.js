import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { io } from '../node_modules/socket.io/client-dist/socket.io.esm.min.js';

// ============================================================================
// 1. CATÁLOGO INTACTO DE ASSETS REALES (.GLB & KROM_KLOUD.PNG)
// ============================================================================
const ASSET_URLS = {
  'placa-madre.glb': new URL('./assets/placa-madre.glb', import.meta.url).href,
  'procesador.glb': new URL('./assets/procesador.glb', import.meta.url).href,
  'ram.glb': new URL('./assets/ram.glb', import.meta.url).href,
  'hdd.glb': new URL('./assets/hdd.glb', import.meta.url).href,
  '2.5.glb': new URL('./assets/2.5.glb', import.meta.url).href,
  '.5.glb': new URL('./assets/2.5.glb', import.meta.url).href,
  'ssd970evo.glb': new URL('./assets/ssd970evo.glb', import.meta.url).href,
  'ssd-corsair.glb': new URL('./assets/ssd-corsair.glb', import.meta.url).href,
  'usbport.glb': new URL('./assets/usbport.glb', import.meta.url).href,
  'usbflash.glb': new URL('./assets/usbflash.glb', import.meta.url).href,
  'usbbodyplug.glb': new URL('./assets/usbbodyplug.glb', import.meta.url).href,
  'xbox_360_joystick_3d_scan.glb': new URL('./assets/xbox_360_joystick_3d_scan.glb', import.meta.url).href,
  'krom_kloud.png': new URL('./assets/krom_kloud.png', import.meta.url).href
};

const ORBIT_RING_RADII = { 1: 5.4, 2: 9.2, 3: 12.8 };

const GLB_ASSET_SPECS = {
  'placa-madre.glb': {
    file: 'placa-madre.glb',
    category: 'CORE',
    isCore: true,
    isSunCenter: true,
    orbitRing: 0,
    label: 'Placa Madre ATX & PCIe',
    targetSize: 4.5,
    orientation: { x: 0.28, y: 0.0, z: 0.0 }
  },
  'procesador.glb': {
    file: 'procesador.glb',
    category: 'CORE',
    isCore: true,
    isSunCenter: false,
    orbitRing: 1,
    label: 'Procesador Central Multi-Core',
    targetSize: 2.45,
    orientation: { x: 0.42, y: 0.25, z: 0.0 }
  },
  'ram.glb': {
    file: 'ram.glb',
    category: 'RAM',
    isCore: true,
    isSunCenter: false,
    orbitRing: 1,
    label: 'Memoria RAM 32GB DDR4 3200MHz',
    targetSize: 2.65,
    orientation: { x: 0.32, y: -0.26, z: 0.0 }
  },
  'ssd970evo.glb': {
    file: 'ssd970evo.glb',
    category: 'NVME_SSD',
    isCore: false,
    isSunCenter: false,
    orbitRing: 2,
    label: 'SSD M.2 NVMe Samsung 970 EVO',
    targetSize: 3.15,
    orientation: { x: 0.48, y: 0.18, z: 0.06 }
  },
  'ssd-corsair.glb': {
    file: 'ssd-corsair.glb',
    category: 'NVME_SSD',
    isCore: false,
    isSunCenter: false,
    orbitRing: 2,
    label: 'Unidad SSD NVMe Corsair MP600',
    targetSize: 3.15,
    orientation: { x: 0.44, y: -0.2, z: -0.05 }
  },
  'hdd.glb': {
    file: 'hdd.glb',
    category: 'NVME_SSD',
    isCore: false,
    isSunCenter: false,
    orbitRing: 2,
    label: 'Disco Duro Mecánico SATA',
    targetSize: 3.05,
    orientation: { x: 0.4, y: -0.25, z: 0.0 }
  },
  'usbport.glb': {
    file: 'usbport.glb',
    category: 'USB',
    isCore: false,
    isSunCenter: false,
    orbitRing: 3,
    label: 'Puerto USB 3.2 Base en Placa',
    targetSize: 2.35,
    orientation: { x: 0.3, y: 0.35, z: 0.0 }
  },
  'usbflash.glb': {
    file: 'usbflash.glb',
    category: 'USB',
    isCore: false,
    isSunCenter: false,
    orbitRing: 3,
    label: 'Memoria USB Flash / Pendrive',
    targetSize: 2.75,
    orientation: { x: 0.36, y: -0.3, z: 0.06 }
  },
  'usbbodyplug.glb': {
    file: 'usbbodyplug.glb',
    category: 'USB',
    isCore: false,
    isSunCenter: false,
    orbitRing: 3,
    label: 'Cuerpo de Conector USB',
    targetSize: 2.45,
    orientation: { x: 0.34, y: 0.26, z: -0.04 }
  },
  '.5.glb': {
    file: '.5.glb',
    category: 'USB',
    isCore: false,
    isSunCenter: false,
    orbitRing: 3,
    label: 'Componente Auxiliar USB / Unidad (.5.glb)',
    targetSize: 2.85,
    orientation: { x: 0.42, y: 0.22, z: 0.0 }
  },
  'xbox_360_joystick_3d_scan.glb': {
    file: 'xbox_360_joystick_3d_scan.glb',
    category: 'GAMEPAD',
    isCore: false,
    isSunCenter: false,
    orbitRing: 3,
    label: 'Gamepad Krom KLOUD / Escaneo 3D',
    targetSize: 3.45,
    orientation: { x: 0.32, y: 0.0, z: 0.0 }
  }
};

const STATUS_COLORS = {
  ESTABLE: {
    hex: 0x38bdf8,
    css: '#38bdf8',
    label: 'ESTABLE',
    glowClass: 'glow-stable',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/35'
  },
  ADVERTENCIA: {
    hex: 0xf59e0b,
    css: '#f59e0b',
    label: 'ADVERTENCIA',
    glowClass: 'glow-warning',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/40'
  },
  CRITICO: {
    hex: 0xf43f5e,
    css: '#f43f5e',
    label: 'CRÍTICO',
    glowClass: 'glow-critical',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/50'
  }
};

// Inicializar imagen krom_kloud.png sin provocar peticiones 404 previas
document.querySelectorAll('[data-krom-img]').forEach(imgEl => {
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = '/assets/krom_kloud.png';
  };
  imgEl.src = ASSET_URLS['krom_kloud.png'];
});

// ============================================================================
// 2. DATOS BASE REALES DEL ENTORNO DE KEVIN ALEXIS BAHAMONDE CÁRDENAS
// ============================================================================
const AUTHOR_METADATA = {
  author: 'Kevin Alexis Bahamonde Cárdenas',
  role: 'Técnico en Informática · Desarrollador Full-Stack & 3D Web',
  email: 'alexis.bahamonde172@gmail.com',
  version: 'HAL-Nexus | Plataforma de Telemetría y Diagnóstico de Hardware 3D'
};

function createDefaultHardwareDevices() {
  return [
    {
      deviceId: 'CORE-MOBO',
      codigo_hw: 'CORE-MOBO',
      portId: 'PCIe 4.0 x16 • ATX_MAIN',
      nombre: 'Placa Madre Principal ATX & Subsistema VRM',
      tipo: 'MOTHERBOARD',
      interfaz: 'Arquitectura Base ATX • PCIe AER',
      estado: 'ESTABLE',
      glbAsset: 'placa-madre.glb',
      moboSpecs: {
        manufacturer: 'ASUS / Workstation',
        model: 'ATX Mainboard Rev 2.5',
        version: 'BIOS 2026',
        ramSlotsOccupied: 2,
        ramSlotsTotal: 4,
        ramMaxSupportedGB: 128,
        cpuCurrentSpeedMHz: 4150,
        cpuLoadPct: 14,
        chipsetTempC: 41.5,
        cpuTempC: 45.2,
        gpus: [
          {
            model: 'GPU Dedicada PCIe x16 (WebGL High-Performance)',
            gpuType: 'DEDICADA',
            vramLabel: '8192 MB GDDR6',
            driver: 'Mesa / NVIDIA Studio',
            busAddress: '0000:01:00.0',
            utilizationPct: 18,
            temperatureC: 47
          }
        ]
      },
      electricalChronology: {
        voltageNowV: 12.08,
        voltageRails: {
          rail12V: 12.08,
          rail5VVbus: 5.02,
          rail3V3: 3.31,
          cpuVcoreV: 1.185
        },
        acStatusLabel: 'Línea AC Estable',
        currentBootDateTime: 'Sesión Activa 2026',
        uptimeContinuousFormatted: '04h 32m',
        powerOnHoursTotal: 1,
        powerCycleCountTotal: 1
      }
    },
    {
      deviceId: 'CORE-CPU',
      codigo_hw: 'CORE-CPU',
      portId: 'CPU::SOCKET_0',
      nombre: 'Procesador Central Multi-Core (8C / 16T)',
      tipo: 'CPU',
      interfaz: 'x86_64 • Telemetría 1000ms',
      estado: 'ESTABLE',
      glbAsset: 'procesador.glb',
      cpuSpecs: {
        manufacturer: 'AMD / Intel',
        brand: '8-Core / 16-Thread Processor',
        physicalCores: 8,
        threads: 16,
        baseSpeedMHz: 3400,
        boostSpeedMHz: 4650,
        currentSpeedMHz: 4120,
        loadPct: 14.2,
        temperatureC: 45.2,
        maxCoreTempC: 47.0,
        governor: 'schedutil',
        socket: 'AM4 / LGA',
        cacheL2MB: 4,
        cacheL3MB: 32,
        cores: Array.from({ length: 8 }, (_, idx) => ({
          shortLabel: `C${idx}`,
          tempC: Number((43.5 + (idx % 3) * 1.1).toFixed(1)),
          loadPct: 10 + ((idx * 5) % 24),
          speedMHz: 3950 + (idx % 4) * 75
        }))
      }
    },
    {
      deviceId: 'CORE-RAM',
      codigo_hw: 'CORE-RAM',
      portId: 'DIMM_A2 + DIMM_B2',
      nombre: 'Memoria RAM 32GB DDR4 3200MHz Dual-Channel',
      tipo: 'RAM',
      interfaz: 'Dual-Channel Simétrico (2x16GB)',
      estado: 'ESTABLE',
      glbAsset: 'ram.glb',
      ramSpecs: {
        totalPhysicalGB: 32,
        usableTotalGB: 31.8,
        activeUsedGB: 9.4,
        usedPct: 29,
        type: 'DDR4',
        clockSpeedMHz: 3200,
        voltageV: 1.35,
        formFactor: 'DIMM / Dual-Channel',
        channelConfig: 'Dual-Channel (2x16GB)',
        occupiedSlots: 2,
        manufacturer: 'Corsair / Kingston Fury',
        configSummary: '2 × 16 GB DDR4 @ 3200 MHz',
        modules: [
          { bank: 'BANK A2', formFactor: 'DDR4', sizeGB: 16, type: 'DDR4', clockSpeedMHz: 3200, manufacturer: 'Kingston / Corsair', partNum: 'KF432C16BB/16' },
          { bank: 'BANK B2', formFactor: 'DDR4', sizeGB: 16, type: 'DDR4', clockSpeedMHz: 3200, manufacturer: 'Kingston / Corsair', partNum: 'KF432C16BB/16' }
        ]
      }
    },
    {
      deviceId: 'STORAGE-970EVO',
      codigo_hw: 'STORAGE-970EVO',
      portId: '/dev/nvme0n1 • M.2_1 (Hardware Local)',
      nombre: 'SAMSUNG MZALQ512HBLU (476.9 GB • NVMe Local)',
      tipo: 'STORAGE',
      interfaz: 'PCIe NVMe M.2 • /dev/nvme0n1',
      estado: 'ESTABLE',
      latencia_ms: 0.08,
      glbAsset: 'ssd970evo.glb',
      isPhysicalHardware: true,
      hardwareBadge: 'HARDWARE LOCAL DETECTADO',
      realNodePath: '/dev/nvme0n1',
      smart: {
        devicePath: '/dev/nvme0n1',
        realNodePath: '/dev/nvme0n1',
        isPhysicalHardware: true,
        hardwareBadge: 'HARDWARE LOCAL DETECTADO',
        model: 'SAMSUNG MZALQ512HBLU-00BL2',
        health: 'PASSED',
        percentageUsed: 1,
        temperatureC: 35,
        powerOnHours: 1,
        powerCycles: 1,
        unsafeShutdowns: 0,
        reallocatedSectors: 0,
        crcErrors: 0,
        transport: 'NVMe',
        size: '476.9 GB',
        serial: 'S69ENX0T530963',
        firmware: 'BL2QFXM7',
        benchmark: { cachedReadMBps: 6840, bufferedReadMBps: 3480 }
      }
    },
    {
      deviceId: 'STORAGE-CORSAIR',
      codigo_hw: 'STORAGE-CORSAIR',
      portId: 'No montado • Catálogo 3D',
      nombre: 'Corsair Force MP600 NVMe M.2 (Modelo 3D)',
      tipo: 'STORAGE',
      interfaz: 'PCIe Gen4 x4 • Modelo 3D de Referencia',
      estado: 'ESTABLE',
      latencia_ms: 0,
      glbAsset: 'ssd-corsair.glb',
      isPhysicalHardware: false,
      hardwareBadge: 'MODELO 3D DE REFERENCIA',
      smart: {
        devicePath: 'No montado',
        realNodePath: null,
        isPhysicalHardware: false,
        hardwareBadge: 'MODELO 3D DE REFERENCIA',
        model: 'Corsair Force MP600 (No montado)',
        health: 'MODELO 3D DE REFERENCIA',
        percentageUsed: 0,
        temperatureC: null,
        powerOnHours: 0,
        powerCycles: 0,
        unsafeShutdowns: 0,
        reallocatedSectors: 0,
        crcErrors: 0,
        transport: 'NVMe',
        size: 'No montado',
        serial: 'REF-3D-CORSAIR',
        firmware: 'CATÁLOGO-3D',
        benchmark: { cachedReadMBps: 0, bufferedReadMBps: 0 },
        simulatedPreset: {
          devicePath: '/dev/nvme1n1 (Simulado)',
          model: 'Corsair Force MP600 1TB (Simulado)',
          health: 'PASSED',
          percentageUsed: 1,
          temperatureC: 39,
          powerOnHours: 320,
          size: '1.0 TB (Simulado)',
          serial: 'SIM-MP600-3D',
          firmware: 'EGFM13.0',
          bufferedReadMBps: 4920
        }
      }
    },
    {
      deviceId: 'STORAGE-HDD',
      codigo_hw: 'STORAGE-HDD',
      portId: 'No montado • Catálogo 3D',
      nombre: 'Disco Duro Mecánico SATA 3.5" (Modelo 3D)',
      tipo: 'STORAGE',
      interfaz: 'SATA III 6.0 Gb/s • Modelo 3D de Referencia',
      estado: 'ESTABLE',
      latencia_ms: 0,
      glbAsset: 'hdd.glb',
      isPhysicalHardware: false,
      hardwareBadge: 'MODELO 3D DE REFERENCIA',
      smart: {
        devicePath: 'No montado',
        realNodePath: null,
        isPhysicalHardware: false,
        hardwareBadge: 'MODELO 3D DE REFERENCIA',
        model: 'Seagate BarraCuda SATA (No montado)',
        health: 'MODELO 3D DE REFERENCIA',
        percentageUsed: 0,
        temperatureC: null,
        powerOnHours: 0,
        powerCycles: 0,
        unsafeShutdowns: 0,
        reallocatedSectors: 0,
        crcErrors: 0,
        transport: 'SATA',
        isRotational: true,
        size: 'No montado',
        serial: 'REF-3D-HDD',
        firmware: 'CATÁLOGO-3D',
        benchmark: { cachedReadMBps: 0, bufferedReadMBps: 0 },
        simulatedPreset: {
          devicePath: '/dev/sda (Simulado)',
          model: 'Seagate BarraCuda 2TB (Simulado)',
          health: 'PASSED',
          percentageUsed: 2,
          temperatureC: 33,
          powerOnHours: 480,
          size: '2.0 TB (Simulado)',
          serial: 'SIM-HDD-3D',
          firmware: 'CC26',
          bufferedReadMBps: 205
        }
      }
    },
    {
      deviceId: 'USB-PORT',
      codigo_hw: 'USB-PORT',
      portId: 'usb1::root_hub_3.2',
      nombre: 'Puerto USB 3.2 Base en Placa (VBUS)',
      tipo: 'USB',
      subtipo: 'USB 3.2 Gen 2 (10 Gbps)',
      interfaz: 'xHCI Host Controller',
      connectionType: 'Root Hub Integrado',
      voltaje_vbus: 5.02,
      latencia_ms: 0.35,
      pollingRateHz: 1000,
      pollingJitterMs: 0.14,
      bus_info: 'Bus 001 Device 001: xHCI SuperSpeed Root Hub',
      estado: 'ESTABLE',
      glbAsset: 'usbport.glb'
    },
    {
      deviceId: 'USB-FLASH',
      codigo_hw: 'USB-FLASH',
      portId: 'usb2::port_1-2',
      nombre: 'Memoria USB Flash SuperSpeed',
      tipo: 'USB',
      subtipo: 'USB Mass Storage 3.2',
      interfaz: 'Bulk-Only Transport',
      connectionType: 'USB 3.2 Directo',
      voltaje_vbus: 5.0,
      latencia_ms: 0.9,
      pollingRateHz: 1000,
      pollingJitterMs: 0.21,
      bus_info: 'Bus 002 Device 003: SanDisk / Kingston USB 3.2',
      estado: 'ESTABLE',
      glbAsset: 'usbflash.glb'
    },
    {
      deviceId: 'USB-PLUG',
      codigo_hw: 'USB-PLUG',
      portId: 'usb1::port_1-4',
      nombre: 'Cuerpo de Conector USB / Transceptor HID',
      tipo: 'USB',
      subtipo: 'USB HID Transceiver',
      interfaz: 'USB 2.0 Full-Speed HID',
      connectionType: 'Receptor USB 2.4GHz',
      isHid: true,
      voltaje_vbus: 5.01,
      latencia_ms: 1.0,
      pollingRateHz: 1000,
      pollingJitterMs: 0.18,
      bus_info: 'Bus 001 Device 004: Composite HID Receiver',
      estado: 'ESTABLE',
      glbAsset: 'usbbodyplug.glb'
    },
    {
      deviceId: 'USB-AUX-5',
      codigo_hw: 'USB-AUX-5',
      portId: 'usb2::aux_bridge_2.5',
      nombre: 'Componente Auxiliar Ensamblaje USB (.5.glb)',
      tipo: 'USB',
      subtipo: 'USB / SATA Bridge 2.5"',
      interfaz: 'UASP SuperSpeed Bridge',
      connectionType: 'Ensamblaje USB',
      voltaje_vbus: 4.99,
      latencia_ms: 0.75,
      pollingRateHz: 1000,
      pollingJitterMs: 0.19,
      bus_info: 'Bus 002 Device 005: UASP Bridge Module (.5.glb)',
      estado: 'ESTABLE',
      glbAsset: '.5.glb'
    },
    {
      deviceId: 'HID-GAMEPAD',
      codigo_hw: 'HID-GAMEPAD',
      portId: 'hidraw0 • NXKROMKLD',
      nombre: 'Gamepad Inalámbrico Krom KLOUD (NXKROMKLD)',
      tipo: 'GAMEPAD',
      interfaz: 'XInput / Web Gamepad API',
      connectionType: 'Wireless 2.4GHz / USB',
      voltaje_vbus: 5.0,
      latencia_ms: 2.0,
      pollingRateHz: 250,
      pollingJitterMs: 0.24,
      estado: 'ESTABLE',
      glbAsset: 'xbox_360_joystick_3d_scan.glb',
      hidDescriptors: {
        bInterval: 4,
        theoreticalPollingHz: 250,
        wMaxPacketSize: '0x0020 (32B)',
        interfaceProtocol: 'XInput / Krom KLOUD NXKROMKLD',
        MaxPower: '500mA'
      }
    }
  ];
}

// Estado global de navegación, telemetría y visualización 3D
let currentPage = 'inicio';
let labViewMode = 'INSPECTOR'; // 'INSPECTOR' | 'SOLAR'
let usbAssemblyMode = false;
let heroPreviewAsset = 'placa-madre.glb';
let activeCategoryFilter = 'ALL';
let activeDeviceId = 'CORE-MOBO';
let autoOrbitEnabled = true;
let activeTerminalTab = 'db';
let socket = null;
let activeLiveTelemetryTargetId = null;

// Mejora 1: Control de telemetría real vs Modelos 3D de referencia no montados
let simulateReferenceStorageTelemetry = false;
let linkReferenceNvmeToPrimary = false;
let primaryLocalNvmeSmart = null;

// Mejora 2: Estado de Hotspots 3D de Placa Madre, GPU WebGL real y Batería/AC en vivo
let activeMoboHotspot = 'general';
const detectedWebglGpu = {
  vendor: 'WebGL Vendor',
  renderer: 'Detectando vía WEBGL_debug_renderer_info...'
};
const liveBatteryState = {
  supported: false,
  charging: true,
  levelPct: 100,
  chargingTimeSec: 0,
  dischargingTimeSec: null,
  statusLabel: 'AC Directo / En línea (100%)'
};

const MOTHERBOARD_HOTSPOTS = {
  general: {
    key: 'general',
    label: 'Vista General ATX',
    cam: { x: 0, y: 2.9, z: 6.8 },
    target: { x: 0, y: 0, z: 0 },
    ring: { x: 0, y: -1.55, z: 0, scale: 1.0, visible: false }
  },
  vrm_cpu: {
    key: 'vrm_cpu',
    label: 'Zoom Fases VRM & CPU',
    cam: { x: -0.55, y: 1.85, z: 3.15 },
    target: { x: -0.35, y: 0.55, z: -0.2 },
    ring: { x: -0.35, y: 0.55, z: 0.12, scale: 0.42, visible: true }
  },
  ram_ddr4: {
    key: 'ram_ddr4',
    label: 'Bancos RAM DDR4',
    cam: { x: 1.15, y: 1.75, z: 3.25 },
    target: { x: 0.78, y: 0.45, z: -0.15 },
    ring: { x: 0.78, y: 0.45, z: 0.14, scale: 0.44, visible: true }
  },
  m2_pcie: {
    key: 'm2_pcie',
    label: 'Slot M.2 & PCIe',
    cam: { x: 0.15, y: 1.55, z: 3.3 },
    target: { x: 0.05, y: -0.42, z: 0.2 },
    ring: { x: 0.05, y: -0.42, z: 0.22, scale: 0.46, visible: true }
  },
  vbus_5v: {
    key: 'vbus_5v',
    label: 'Puertos VBUS 5V',
    cam: { x: -1.65, y: 1.65, z: 3.25 },
    target: { x: -1.18, y: 0.25, z: -0.25 },
    ring: { x: -1.18, y: 0.25, z: 0.15, scale: 0.38, visible: true }
  }
};

let currentTelemetry = {
  timestamp: Date.now(),
  globalState: 'ESTABLE',
  summary: { minUsbVbus: 5.0, gpuCount: 1 },
  devices: createDefaultHardwareDevices(),
  logs: [
    {
      created_at: Date.now(),
      severidad: 'INFO',
      codigo_error: 'SYS_BOOT_OK',
      mensaje: 'Motor 3D ACESFilmic (0.82) y anisotropía máxima inicializados a 60 FPS.'
    },
    {
      created_at: Date.now(),
      severidad: 'INFO',
      codigo_error: 'RAM_DUAL_OK',
      mensaje: '32GB DDR4 3200MHz Dual-Channel (2x16GB) verificados sin errores EDAC.'
    },
    {
      created_at: Date.now(),
      severidad: 'INFO',
      codigo_error: 'SMART_NVME_OK',
      mensaje: 'Unidades NVMe Samsung 970 EVO y Corsair MP600 en estado PASSED (100%).'
    }
  ],
  kernelRing: [
    '[    0.412890] pci 0000:01:00.0: [10de:2484] PCIe Gen4 x16 link nominal',
    '[    1.084211] nvme nvme0: pci function 0000:02:00.0 Samsung SSD 970 EVO S.M.A.R.T. PASSED',
    '[    1.621044] usb 1-4: new full-speed USB device number 4 (Krom KLOUD NXKROMKLD HID)',
    '[    2.104512] EDAC MC0: 32768 MB DDR4 @ 3200 MT/s Dual-Channel active (0 errors)'
  ]
};

// ============================================================================
// 3. MOTOR 3D: EXPOSICIÓN 0.82, LUCES SUAVES, ANISOTROPÍA MÁXIMA Y ESTRELLAS
// ============================================================================
const container = document.getElementById('canvas-container');
const interactiveMountEl = document.getElementById('interactive-3d-mount');
const heroViewportEl = document.getElementById('hero-3d-viewport');
const labViewportEl = document.getElementById('lab-3d-viewport');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setClearColor(0x050505, 1);
renderer.setSize(window.innerWidth, window.innerHeight);

// 1. Configuración de Nitidez y Exposición Atenuada en el Renderer (Monolith Carbon)
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Detectar el nombre real de la GPU mediante la extensión WebGL WEBGL_debug_renderer_info
function detectWebglGpuRenderer() {
  try {
    const gl = renderer.getContext();
    if (!gl) return;
    const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbgInfo) {
      const unmaskedVendor = gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL);
      const unmaskedRenderer = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL);
      if (unmaskedVendor) detectedWebglGpu.vendor = String(unmaskedVendor).trim();
      if (unmaskedRenderer) detectedWebglGpu.renderer = String(unmaskedRenderer).trim();
    } else {
      const fallbackRenderer = gl.getParameter(gl.RENDERER);
      const fallbackVendor = gl.getParameter(gl.VENDOR);
      if (fallbackVendor) detectedWebglGpu.vendor = String(fallbackVendor).trim();
      if (fallbackRenderer) detectedWebglGpu.renderer = String(fallbackRenderer).trim();
    }
  } catch {
    detectedWebglGpu.renderer = 'WebGL2 Hardware Accelerated GPU';
  }
  const gpuEl = document.getElementById('display-webgl-gpu');
  if (gpuEl) gpuEl.textContent = `${detectedWebglGpu.renderer} (${detectedWebglGpu.vendor})`;
}
detectWebglGpuRenderer();

// Monitorear estado de energía AC/Batería en vivo usando navigator.getBattery()
function initLiveBatteryTelemetry() {
  if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') {
    liveBatteryState.supported = false;
    liveBatteryState.statusLabel = 'AC Directo (API Battery estática)';
    return;
  }
  navigator
    .getBattery()
    .then(battery => {
      liveBatteryState.supported = true;
      const syncBattery = () => {
        liveBatteryState.charging = Boolean(battery.charging);
        liveBatteryState.levelPct = Math.round((Number(battery.level) || 1) * 100);
        liveBatteryState.chargingTimeSec = Number.isFinite(battery.chargingTime) ? battery.chargingTime : 0;
        liveBatteryState.dischargingTimeSec = Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null;
        const modeTxt = liveBatteryState.charging ? 'AC Conectado (Cargando)' : 'Batería Activa (Descarga)';
        liveBatteryState.statusLabel = `${modeTxt} • ${liveBatteryState.levelPct}%`;
        if (currentPage === 'laboratorio' && activeDeviceId === 'CORE-MOBO') {
          updateInspectorCardUI('CORE-MOBO');
        }
      };
      syncBattery();
      battery.addEventListener('chargingchange', syncBattery);
      battery.addEventListener('levelchange', syncBattery);
      battery.addEventListener('chargingtimechange', syncBattery);
      battery.addEventListener('dischargingtimechange', syncBattery);
    })
    .catch(() => {
      liveBatteryState.supported = false;
      liveBatteryState.statusLabel = 'Línea AC Estable (100%)';
    });
}
initLiveBatteryTelemetry();

// Entorno PBR neutro sutil para superficies metálicas controladas sin quemar blancos
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const roomEnv = new RoomEnvironment();
const sharedEnvTexture = pmremGenerator.fromScene(roomEnv, 0.032).texture;
roomEnv.dispose();

// 3. Función de Mejora de Calidad al Cargar Cualquier Modelo de assets/*.glb
function enhanceLoadedGLB(gltfScene, rendererInstance) {
  const maxAnisotropy = rendererInstance.capabilities.getMaxAnisotropy();

  gltfScene.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(mat => {
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach(mapType => {
          if (mat[mapType]) {
            mat[mapType].anisotropy = maxAnisotropy;
            mat[mapType].needsUpdate = true;
          }
        });

        if (typeof mat.envMapIntensity !== 'undefined') {
          mat.envMapIntensity = 0.72;
        }
        if (typeof mat.roughness !== 'undefined') {
          mat.roughness = Math.min(1.0, Math.max(0.28, mat.roughness));
        }
        if (typeof mat.emissiveIntensity !== 'undefined' && mat.emissiveIntensity > 0.4) {
          mat.emissiveIntensity = 0.35;
        }
        mat.needsUpdate = true;
      });
    }
  });
}

// ----------------------------------------------------------------------------
// ESCENA DE FONDO ESPACIAL MONOLITH CARBON (#050505 + ESTRELLAS SUTILES + PLACA-MADRE)
// ----------------------------------------------------------------------------
const bgScene = new THREE.Scene();
bgScene.background = new THREE.Color(0x050505);
bgScene.fog = new THREE.FogExp2(0x050505, 0.014);
bgScene.environment = sharedEnvTexture;

const bgCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 260);
bgCamera.position.set(0, 2.5, 13.5);

const bgAmbient = new THREE.AmbientLight(0xd4d4d8, 0.42);
const bgKey = new THREE.DirectionalLight(0xf4f4f5, 0.68);
bgKey.position.set(5, 8, 6);
const bgRim = new THREE.DirectionalLight(0xa1a1aa, 0.28);
bgRim.position.set(-6, 4, -5);
bgScene.add(bgAmbient, bgKey, bgRim);

// Campo de estrellas sutil sobre negro carbón (#050505)
const STAR_COUNT = 2000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
const starPalette = [
  new THREE.Color(0xf4f4f5),
  new THREE.Color(0xd4d4d8),
  new THREE.Color(0xa1a1aa),
  new THREE.Color(0x71717a)
];

for (let i = 0; i < STAR_COUNT; i++) {
  const r = 24 + Math.random() * 120;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.75;
  starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

  const pick = Math.random();
  const c = pick < 0.55 ? starPalette[0] : pick < 0.82 ? starPalette[1] : pick < 0.94 ? starPalette[2] : starPalette[3];
  starColors[i * 3] = c.r;
  starColors[i * 3 + 1] = c.g;
  starColors[i * 3 + 2] = c.b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.22,
  vertexColors: true,
  transparent: true,
  opacity: 0.42,
  depthWrite: false
});
const starFieldPoints = new THREE.Points(starGeometry, starMaterial);
bgScene.add(starFieldPoints);

const bgMoboGroup = new THREE.Group();
bgMoboGroup.position.set(2.4, -0.3, -2.5);
bgScene.add(bgMoboGroup);

// ----------------------------------------------------------------------------
// ESCENA PRINCIPAL INTERACTIVA (HERO & LABORATORIO 3D)
// ----------------------------------------------------------------------------
const stageScene = new THREE.Scene();
stageScene.environment = sharedEnvTexture;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);

// Ajuste responsivo de distancia Z de la cámara si window.innerWidth < 768 para evitar recortes en vertical
function getResponsiveCameraZ(baseZ = 6.4) {
  if (window.innerWidth < 480) {
    return baseZ + 2.7;
  }
  if (window.innerWidth < 768) {
    return baseZ + 1.85;
  }
  return baseZ;
}

camera.position.set(0, 2.9, getResponsiveCameraZ(6.8));

// 2. Iluminación Neutra Suave y Balanceada sin quemar blancos
const ambientLight = new THREE.AmbientLight(0xd4d4d8, 0.55);
const keyLight = new THREE.DirectionalLight(0xf4f4f5, 0.92);
keyLight.position.set(5, 8, 6);
const rimLight = new THREE.DirectionalLight(0xa1a1aa, 0.36);
rimLight.position.set(-6, 5, -6);
stageScene.add(ambientLight, keyLight, rimLight);

const controls = new OrbitControls(camera, interactiveMountEl);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enableZoom = false; // En Hero está desactivado para permitir scroll con el pulgar (pan-y); en Lab se activa
controls.minDistance = 2.6;
controls.maxDistance = 42;
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};
controls.target.set(0, 0, 0);

// Grupos de la escena interactiva:
// a) inspectorStageGroup: muestra el modelo seleccionado (o ensamblaje USB) con máxima nitidez
// b) solarStageGroup: muestra placa-madre.glb en (0,0,0) + las 3 órbitas con los 11 modelos .glb
const inspectorStageGroup = new THREE.Group();
const solarStageGroup = new THREE.Group();
solarStageGroup.visible = false;
stageScene.add(inspectorStageGroup, solarStageGroup);

// Anillo discreto de referencia bajo el modelo en el Inspector
const inspectorBaseRing = new THREE.Mesh(
  new THREE.RingGeometry(2.05, 2.13, 96),
  new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.28
  })
);
inspectorBaseRing.rotation.x = Math.PI / 2;
inspectorBaseRing.position.y = -1.65;
inspectorBaseRing.raycast = () => {};
inspectorStageGroup.add(inspectorBaseRing);

const inspectorModelHolder = new THREE.Group();
inspectorStageGroup.add(inspectorModelHolder);

// Anillo marcador 3D para Hotspots de Placa Madre (VRM, RAM DDR4, M.2 PCIe, VBUS 5V)
const hotspotFocusRingMesh = new THREE.Mesh(
  new THREE.RingGeometry(0.42, 0.52, 64),
  new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.78
  })
);
hotspotFocusRingMesh.visible = false;
hotspotFocusRingMesh.raycast = () => {};
inspectorStageGroup.add(hotspotFocusRingMesh);

// Anillos orbitales discretos para el modo Sistema Solar (11 modelos .glb)
[
  { r: ORBIT_RING_RADII[1], color: 0x38bdf8, opacity: 0.24 },
  { r: ORBIT_RING_RADII[2], color: 0x0ea5e9, opacity: 0.18 },
  { r: ORBIT_RING_RADII[3], color: 0x64748b, opacity: 0.16 }
].forEach(cfg => {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(cfg.r - 0.035, cfg.r + 0.035, 128),
    new THREE.MeshBasicMaterial({
      color: cfg.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: cfg.opacity
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.15;
  ring.raycast = () => {};
  solarStageGroup.add(ring);
});

// ============================================================================
// 4. CARGA CON GLTFLOADER DE TODOS LOS MODELOS REALES EN assets/
// ============================================================================
const gltfLoader = new GLTFLoader();
const glbTemplateCache = new Map();
const glbLoadingPromises = new Map();
const glbLoadErrors = new Map();

const loadingBannerEl = document.getElementById('glb-loading-banner');
const loadingTextEl = document.getElementById('glb-loading-text');
const loadingCountEl = document.getElementById('glb-loading-count');
const loadingBarEl = document.getElementById('glb-loading-bar');
const errorBannerEl = document.getElementById('glb-error-banner');
const errorDetailEl = document.getElementById('glb-error-detail');

let totalAssetsToLoad = Object.keys(GLB_ASSET_SPECS).length;
let loadedAssetsCount = 0;

function updateGlbLoadingUI(currentFile = '', filePct = 0) {
  if (!loadingBannerEl) return;
  const pct = Math.min(
    100,
    Math.round(((loadedAssetsCount + filePct / 100) / Math.max(1, totalAssetsToLoad)) * 100)
  );

  if (loadedAssetsCount >= totalAssetsToLoad) {
    if (loadingTextEl) loadingTextEl.textContent = `${totalAssetsToLoad}/${totalAssetsToLoad} modelos .glb cargados con anisotropía máxima`;
    if (loadingCountEl) loadingCountEl.textContent = '100%';
    if (loadingBarEl) loadingBarEl.style.width = '100%';
    setTimeout(() => {
      loadingBannerEl.classList.add('hidden');
    }, 650);
  } else {
    loadingBannerEl.classList.remove('hidden');
    if (loadingTextEl) loadingTextEl.textContent = `Cargando assets/${currentFile} (${loadedAssetsCount}/${totalAssetsToLoad})...`;
    if (loadingCountEl) loadingCountEl.textContent = `${pct}%`;
    if (loadingBarEl) loadingBarEl.style.width = `${pct}%`;
  }

  if (errorBannerEl) {
    if (glbLoadErrors.size > 0) {
      const [file, msg] = glbLoadErrors.entries().next().value;
      errorBannerEl.classList.remove('hidden');
      if (errorDetailEl) errorDetailEl.textContent = `${file}: ${msg}`;
    } else {
      errorBannerEl.classList.add('hidden');
    }
  }
}

// Raycast rápido por caja delimitadora para modelos de alta densidad poligonal
const _invMatrix = new THREE.Matrix4();
const _localRay = new THREE.Ray();
const _hitPoint = new THREE.Vector3();
const _worldHitPoint = new THREE.Vector3();

function fastHighPolyMeshRaycast(raycasterInstance, intersects) {
  const geometry = this.geometry;
  if (!geometry) return;
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  if (!geometry.boundingBox) geometry.computeBoundingBox();

  _invMatrix.copy(this.matrixWorld).invert();
  _localRay.copy(raycasterInstance.ray).applyMatrix4(_invMatrix);
  if (!_localRay.intersectsSphere(geometry.boundingSphere)) return;
  if (!_localRay.intersectsBox(geometry.boundingBox)) return;

  _localRay.intersectBox(geometry.boundingBox, _hitPoint);
  if (!_hitPoint) return;

  _worldHitPoint.copy(_hitPoint).applyMatrix4(this.matrixWorld);
  const distance = raycasterInstance.ray.origin.distanceTo(_worldHitPoint);
  if (distance < raycasterInstance.near || distance > raycasterInstance.far) return;

  intersects.push({ distance, point: _worldHitPoint.clone(), object: this, face: null });
}

function getCandidateUrlsForAsset(assetFile) {
  if (assetFile === '.5.glb' || assetFile === '2.5.glb') {
    return [
      ASSET_URLS['2.5.glb'],
      '/src/assets/.5.glb',
      '/assets/.5.glb',
      '/src/assets/2.5.glb',
      '/assets/2.5.glb'
    ].filter(Boolean);
  }
  return [
    ASSET_URLS[assetFile],
    `/src/assets/${assetFile}`,
    `/assets/${assetFile}`
  ].filter(Boolean);
}

function loadGlbTemplate(assetFile) {
  if (glbTemplateCache.has(assetFile)) {
    return Promise.resolve(glbTemplateCache.get(assetFile));
  }
  if ((assetFile === '.5.glb' && glbTemplateCache.has('2.5.glb')) || (assetFile === '2.5.glb' && glbTemplateCache.has('.5.glb'))) {
    const shared = glbTemplateCache.get('2.5.glb') || glbTemplateCache.get('.5.glb');
    glbTemplateCache.set(assetFile, shared);
    loadedAssetsCount = glbTemplateCache.size;
    updateGlbLoadingUI(assetFile, 100);
    return Promise.resolve(shared);
  }
  if (glbLoadingPromises.has(assetFile)) {
    return glbLoadingPromises.get(assetFile);
  }

  const candidateUrls = getCandidateUrlsForAsset(assetFile);
  const promise = new Promise((resolve, reject) => {
    let idx = 0;
    const tryNext = () => {
      if (idx >= candidateUrls.length) {
        const msg = `No se encontró ${assetFile} en assets/`;
        glbLoadErrors.set(assetFile, msg);
        glbLoadingPromises.delete(assetFile);
        updateGlbLoadingUI(assetFile, 0);
        reject(new Error(msg));
        return;
      }

      const url = candidateUrls[idx++];
      gltfLoader.load(
        url,
        gltf => {
          if (!gltf || !gltf.scene) {
            tryNext();
            return;
          }
          // Aplicar mejora de nitidez anisotrópica y reducción de brillo especular
          enhanceLoadedGLB(gltf.scene, renderer);

          glbLoadErrors.delete(assetFile);
          glbTemplateCache.set(assetFile, gltf.scene);
          glbLoadingPromises.delete(assetFile);
          loadedAssetsCount = Math.min(totalAssetsToLoad, glbTemplateCache.size);
          updateGlbLoadingUI(assetFile, 100);
          resolve(gltf.scene);
        },
        evt => {
          if (evt && evt.total > 0) {
            updateGlbLoadingUI(assetFile, Math.min(99, Math.round((evt.loaded / evt.total) * 100)));
          }
        },
        () => tryNext()
      );
    };
    tryNext();
  });

  glbLoadingPromises.set(assetFile, promise);
  return promise;
}

function buildNormalizedModelInstance(templateScene, assetFile, customTargetSize = null) {
  const spec = GLB_ASSET_SPECS[assetFile] || {
    targetSize: 3.0,
    orientation: { x: 0.35, y: 0.2, z: 0 }
  };

  const modelClone = templateScene.clone(true);
  modelClone.position.set(0, 0, 0);
  modelClone.rotation.set(0, 0, 0);
  modelClone.scale.set(1, 1, 1);

  const clonedMaterials = [];
  modelClone.traverse(child => {
    if (child.isMesh && child.geometry) {
      if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
      if (!child.geometry.boundingSphere) child.geometry.computeBoundingSphere();
      if ((child.geometry.attributes.position?.count || 0) > 15000) {
        child.raycast = fastHighPolyMeshRaycast;
      }
      if (child.material) {
        const cloneMat = mat => {
          const m = mat.clone();
          clonedMaterials.push(m);
          return m;
        };
        child.material = Array.isArray(child.material)
          ? child.material.map(cloneMat)
          : cloneMat(child.material);
      }
    }
  });

  enhanceLoadedGLB(modelClone, renderer);

  modelClone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(modelClone);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const desiredSize = customTargetSize || spec.targetSize || 3.0;
  modelClone.scale.setScalar(desiredSize / maxDim);
  modelClone.updateMatrixWorld(true);

  const centeredBox = new THREE.Box3().setFromObject(modelClone);
  const center = new THREE.Vector3();
  centeredBox.getCenter(center);
  modelClone.position.sub(center);
  modelClone.updateMatrixWorld(true);

  const orientationGroup = new THREE.Group();
  orientationGroup.add(modelClone);
  orientationGroup.rotation.set(
    spec.orientation?.x || 0,
    spec.orientation?.y || 0,
    spec.orientation?.z || 0
  );
  return { orientationGroup, clonedMaterials };
}

// Cargar placa-madre.glb para el fondo espacial con estrellas
let bgMoboLoaded = false;
function initBackgroundMotherboard() {
  loadGlbTemplate('placa-madre.glb')
    .then(template => {
      if (bgMoboLoaded) return;
      bgMoboLoaded = true;
      const { orientationGroup } = buildNormalizedModelInstance(template, 'placa-madre.glb', 6.4);
      bgMoboGroup.add(orientationGroup);
    })
    .catch(() => {});
}

// ============================================================================
// 5. GESTIÓN DEL ESCENARIO 3D (INSPECTOR INDIVIDUAL, ENSAMBLAJE USB Y SOLAR)
// ============================================================================
const deviceNodes3D = new Map();
let currentInspectorAssetKey = '';

function clearGroupChildren(group) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }
}

function renderInspectorStageModel(assetFile, isUsbAssembly = false) {
  const modeKey = isUsbAssembly ? 'USB_ASSEMBLY_4' : assetFile;
  if (currentInspectorAssetKey === modeKey && inspectorModelHolder.children.length > 0) {
    return;
  }
  currentInspectorAssetKey = modeKey;
  clearGroupChildren(inspectorModelHolder);

  const pillEl = document.getElementById('lab-active-asset-pill');
  const heroLabelEl = document.getElementById('hero-active-glb-label');

  if (isUsbAssembly) {
    if (pillEl) pillEl.textContent = 'Ensamblaje USB: usbport + usbflash + usbbodyplug + .5.glb';
    const usbFiles = ['usbport.glb', 'usbbodyplug.glb', 'usbflash.glb', '.5.glb'];
    const offsets = [
      { x: -2.4, y: 0.2, z: 0 },
      { x: -0.8, y: -0.15, z: 0.3 },
      { x: 0.85, y: 0.2, z: -0.2 },
      { x: 2.45, y: -0.1, z: 0.15 }
    ];
    usbFiles.forEach((f, idx) => {
      loadGlbTemplate(f)
        .then(tpl => {
          if (currentInspectorAssetKey !== 'USB_ASSEMBLY_4') return;
          const { orientationGroup } = buildNormalizedModelInstance(tpl, f, 2.05);
          orientationGroup.position.set(offsets[idx].x, offsets[idx].y, offsets[idx].z);
          inspectorModelHolder.add(orientationGroup);
        })
        .catch(() => {});
    });
    gsap.to(camera.position, { x: 0, y: 2.8, z: 7.8, duration: 0.65, ease: 'power2.out' });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.65, ease: 'power2.out' });
    return;
  }

  const targetAsset = GLB_ASSET_SPECS[assetFile] ? assetFile : 'placa-madre.glb';
  if (pillEl && currentPage === 'laboratorio') {
    pillEl.textContent = `assets/${targetAsset}`;
  }
  if (heroLabelEl && currentPage === 'inicio') {
    heroLabelEl.textContent = `assets/${targetAsset}`;
  }

  loadGlbTemplate(targetAsset)
    .then(tpl => {
      if (currentInspectorAssetKey !== targetAsset) return;
      const displaySize = targetAsset === 'placa-madre.glb' ? 4.35 : 3.65;
      const { orientationGroup } = buildNormalizedModelInstance(tpl, targetAsset, displaySize);
      inspectorModelHolder.add(orientationGroup);
      inspectorModelHolder.scale.set(0.92, 0.92, 0.92);
      gsap.to(inspectorModelHolder.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' });
    })
    .catch(() => {});
}

// Construcción del Sistema Solar 3D completo (11 modelos .glb)
function resolveDeviceGlbAsset(dev) {
  if (dev.glbAsset && GLB_ASSET_SPECS[dev.glbAsset]) return dev.glbAsset;
  if (dev.glbAsset === '2.5.glb') return '.5.glb';
  const tipo = String(dev.tipo || '').toUpperCase();
  const name = String(dev.nombre || '').toLowerCase();
  if (tipo === 'MOTHERBOARD' || dev.codigo_hw === 'CORE-MOBO') return 'placa-madre.glb';
  if (tipo === 'CPU' || dev.codigo_hw === 'CORE-CPU') return 'procesador.glb';
  if (tipo === 'RAM' || dev.codigo_hw === 'CORE-RAM') return 'ram.glb';
  if (tipo === 'GAMEPAD' || name.includes('krom') || name.includes('joystick') || name.includes('xbox')) {
    return 'xbox_360_joystick_3d_scan.glb';
  }
  if (name.includes('corsair')) return 'ssd-corsair.glb';
  if (name.includes('hdd') || dev.smart?.isRotational) return 'hdd.glb';
  if (tipo === 'STORAGE') return 'ssd970evo.glb';
  if (name.includes('flash') || name.includes('pendrive')) return 'usbflash.glb';
  if (name.includes('root hub') || name.includes('port')) return 'usbport.glb';
  return 'usbbodyplug.glb';
}

function syncHardwareModels3D(devices = []) {
  // Combinar los dispositivos recibidos por WebSocket con el catálogo completo para que los 11 .glb siempre estén disponibles,
  // distinguiendo claramente unidades físicas reales (ej. SAMSUNG MZALQ512HBLU en /dev/nvme0n1) de modelos .glb no montados.
  const mergedByAsset = new Map();
  createDefaultHardwareDevices().forEach(d => mergedByAsset.set(d.glbAsset, d));

  devices.forEach(dev => {
    const asset = resolveDeviceGlbAsset(dev);
    const prev = mergedByAsset.get(asset) || {};
    const canonicalDeviceId = prev.deviceId || dev.deviceId || dev.codigo_hw;

    if (dev.tipo === 'STORAGE' || asset === 'ssd970evo.glb' || asset === 'ssd-corsair.glb' || asset === 'hdd.glb') {
      const devPathStr = String(dev.smart?.devicePath || dev.smart?.realNodePath || dev.realNodePath || '');
      const isRealDisk =
        Boolean(dev.isPhysicalHardware || dev.smart?.isPhysicalHardware) &&
        devPathStr.startsWith('/dev/');

      if (isRealDisk) {
        const enrichedSmart = {
          ...(prev.smart || {}),
          ...(dev.smart || {}),
          devicePath: devPathStr,
          realNodePath: devPathStr,
          isPhysicalHardware: true,
          hardwareBadge: 'HARDWARE LOCAL DETECTADO'
        };
        if (devPathStr.includes('nvme0') || !primaryLocalNvmeSmart) {
          primaryLocalNvmeSmart = enrichedSmart;
        }
        mergedByAsset.set(asset, {
          ...prev,
          ...dev,
          deviceId: canonicalDeviceId,
          codigo_hw: canonicalDeviceId,
          portId: `${devPathStr} • ${dev.portId || 'Hardware Local'}`,
          glbAsset: asset,
          isPhysicalHardware: true,
          hardwareBadge: 'HARDWARE LOCAL DETECTADO',
          realNodePath: devPathStr,
          smart: enrichedSmart
        });
      }
      return;
    }

    mergedByAsset.set(asset, {
      ...prev,
      ...dev,
      deviceId: canonicalDeviceId,
      codigo_hw: canonicalDeviceId,
      portId: dev.portId || dev.bus_info || prev.portId,
      glbAsset: asset
    });
  });

  // Si aún no llegó telemetría remota, conservar los datos del NVMe primario por defecto como referencia local
  const primaryNode = mergedByAsset.get('ssd970evo.glb');
  if (primaryNode?.smart && !primaryLocalNvmeSmart) {
    primaryLocalNvmeSmart = primaryNode.smart;
  }

  const normalizedList = Array.from(mergedByAsset.values());
  currentTelemetry.devices = normalizedList;

  const orbitBuckets = { 0: [], 1: [], 2: [], 3: [] };
  normalizedList.forEach(d => {
    const ring = GLB_ASSET_SPECS[d.glbAsset]?.orbitRing ?? 3;
    orbitBuckets[ring].push(d);
  });

  Object.entries(orbitBuckets).forEach(([ringStr, list]) => {
    const ring = Number(ringStr);
    list.forEach((dev, idx) => {
      const angle = (idx / Math.max(1, list.length)) * Math.PI * 2 + ring * 0.45;
      const radius = ring === 0 ? 0 : ORBIT_RING_RADII[ring];
      const speed = ring === 0 ? 0 : ring === 1 ? 0.08 : ring === 2 ? 0.055 : 0.04;
      upsertSolarNode(dev, ring, radius, angle, speed);
    });
  });

  applyCategoryFilterToScene();
}

function upsertSolarNode(dev, orbitRing, tierRadius, angle, orbitSpeed) {
  const { deviceId, glbAsset } = dev;
  const spec = GLB_ASSET_SPECS[glbAsset];
  let nodeObj = deviceNodes3D.get(deviceId);

  if (!nodeObj) {
    const anchorGroup = new THREE.Group();
    const deviceRootGroup = new THREE.Group();
    deviceRootGroup.userData = { isDeviceRoot: true, deviceId, assetFile: glbAsset };
    anchorGroup.add(deviceRootGroup);

    const pedestalRing = new THREE.Mesh(
      new THREE.RingGeometry(orbitRing === 0 ? 1.9 : 1.05, orbitRing === 0 ? 2.05 : 1.18, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32
      })
    );
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = -1.05;
    pedestalRing.raycast = () => {};
    anchorGroup.add(pedestalRing);

    solarStageGroup.add(anchorGroup);

    nodeObj = {
      deviceId,
      assetFile: glbAsset,
      category: spec?.category || 'USB',
      isSunCenter: orbitRing === 0,
      orbitRing,
      tierRadius,
      angle,
      baseOrbitSpeed: orbitSpeed,
      orbitSpeed,
      anchorGroup,
      deviceRootGroup,
      pedestalRing,
      modelLoaded: false,
      modelLoadFailed: false,
      deviceData: dev
    };
    deviceNodes3D.set(deviceId, nodeObj);

    const x = orbitRing === 0 ? 0 : Math.cos(angle) * tierRadius;
    const z = orbitRing === 0 ? 0 : Math.sin(angle) * tierRadius;
    anchorGroup.position.set(x, 0, z);

    loadGlbTemplate(glbAsset)
      .then(tpl => {
        const curr = deviceNodes3D.get(deviceId);
        if (!curr || curr.modelLoaded) return;
        const { orientationGroup } = buildNormalizedModelInstance(tpl, glbAsset);
        curr.deviceRootGroup.add(orientationGroup);
        curr.modelLoaded = true;
        renderNavigationDeviceList();
      })
      .catch(() => {
        const curr = deviceNodes3D.get(deviceId);
        if (curr) curr.modelLoadFailed = true;
        renderNavigationDeviceList();
      });
  } else {
    nodeObj.deviceData = dev;
  }
}

function applyCategoryFilterToScene() {
  for (const nodeObj of deviceNodes3D.values()) {
    const visible = activeCategoryFilter === 'ALL' || nodeObj.category === activeCategoryFilter;
    nodeObj.anchorGroup.visible = visible;
  }
}

// ============================================================================
// 6. TELEMETRÍA EN VIVO, INSPECTOR LATERAL Y GAMEPAD KROM KLOUD (NXKROMKLD)
// ============================================================================
const DEADZONE_THRESHOLD = 0.08;
const STICK_MAX_TRANSLATE_PX = 16;

const gamepadState = {
  physicalConnected: false,
  connectionType: 'Wireless 2.4GHz / USB',
  demoModeEnabled: false,
  simulatedDriftActive: false,
  simulatedDriftAxis: 2,
  simulatedDriftValue: 0.118,
  controllerBrand: 'Gamepad Inalámbrico Krom KLOUD (NXKROMKLD)',
  axes: [0, 0, 0, 0],
  prevAxes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
  driftDetected: false,
  driftingAxes: [],
  axisDriftTimers: [0, 0, 0, 0],
  lastSampleTimestamp: 0,
  pollingDeltas: [],
  pollingJitterMs: 0.24,
  pollingRateHz: 250
};

const hologramDomNodes = {
  img: document.getElementById('gamepad-hologram-img'),
  leftStick: document.getElementById('telemetry-node-ls'),
  rightStick: document.getElementById('telemetry-node-rs'),
  leftTrigger: document.getElementById('telemetry-node-lt'),
  rightTrigger: document.getElementById('telemetry-node-rt')
};

// Sanitización XSS estricta: limpia caracteres peligrosos (<, >, &, ", ') antes de procesar entradas del usuario
function sanitizeInput(str = '') {
  return String(str)
    .replace(/[<>&"']/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, tone = 'sky') {
  const containerEl = document.getElementById('toast-container');
  if (!containerEl) return;

  const borderClass =
    tone === 'emerald'
      ? 'border-emerald-400/50 text-emerald-200'
      : tone === 'pink'
      ? 'border-pink-400/50 text-pink-200'
      : 'border-sky-400/50 text-sky-200';

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto nexus-surface px-4 py-2.5 rounded-2xl border ${borderClass} text-xs font-medium shadow-2xl page-enter flex items-center gap-2`;

  const dotEl = document.createElement('span');
  dotEl.className = 'w-2 h-2 rounded-full bg-current shrink-0';

  const msgEl = document.createElement('span');
  msgEl.textContent = sanitizeInput(message);

  toast.appendChild(dotEl);
  toast.appendChild(msgEl);
  containerEl.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

function syncOnDemandLiveTelemetry(deviceId) {
  const isLive = deviceId === 'CORE-CPU' || deviceId === 'CORE-MOBO';
  const topLiveEl = document.getElementById('live-telemetry-indicator');
  const cardLiveEl = document.getElementById('card-live-badge');

  if (isLive) {
    if (activeLiveTelemetryTargetId !== deviceId) {
      activeLiveTelemetryTargetId = deviceId;
      if (socket && socket.connected) {
        socket.emit('start_live_telemetry', {
          targetId: deviceId,
          assetFile: deviceId === 'CORE-MOBO' ? 'placa-madre.glb' : 'procesador.glb'
        });
      }
    }
    topLiveEl?.classList.remove('hidden');
    topLiveEl?.classList.add('inline-flex');
    cardLiveEl?.classList.remove('hidden');
    cardLiveEl?.classList.add('inline-flex');
  } else {
    if (activeLiveTelemetryTargetId !== null) {
      activeLiveTelemetryTargetId = null;
      if (socket && socket.connected) socket.emit('stop_live_telemetry');
    }
    topLiveEl?.classList.add('hidden');
    topLiveEl?.classList.remove('inline-flex');
    cardLiveEl?.classList.add('hidden');
    cardLiveEl?.classList.remove('inline-flex');
  }
}

function updateMoboHotspotButtonsUI() {
  document.querySelectorAll('[data-mobo-hotspot]').forEach(btn => {
    const isAct = btn.getAttribute('data-mobo-hotspot') === activeMoboHotspot;
    btn.className = isAct
      ? 'studio-btn-active px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer'
      : 'studio-btn px-2.5 py-1 rounded-xl text-[11px] font-medium cursor-pointer';
  });
}

function focusMotherboardHotspot(hotspotKey) {
  const cfg = MOTHERBOARD_HOTSPOTS[hotspotKey] || MOTHERBOARD_HOTSPOTS.general;
  activeMoboHotspot = cfg.key;
  updateMoboHotspotButtonsUI();

  const currentNode = deviceNodes3D.get(activeDeviceId);
  const isMoboOrCpu =
    currentNode && (currentNode.assetFile === 'placa-madre.glb' || currentNode.assetFile === 'procesador.glb');

  if (!isMoboOrCpu) {
    selectHardwareDevice('CORE-MOBO', false);
  }
  if (labViewMode !== 'INSPECTOR') {
    setLabViewMode('INSPECTOR');
  }

  if (cfg.key !== 'general') {
    autoOrbitEnabled = false;
    const orbitBtn = document.getElementById('btn-cam-orbit');
    if (orbitBtn) {
      orbitBtn.textContent = 'Rotación: OFF';
      orbitBtn.className = 'studio-btn px-2.5 py-1 rounded-xl text-[11px] font-medium cursor-pointer';
    }
    gsap.to(inspectorModelHolder.rotation, { x: 0, y: 0, z: 0, duration: 0.55, ease: 'power2.out' });
  }

  if (cfg.ring && cfg.ring.visible) {
    hotspotFocusRingMesh.visible = true;
    hotspotFocusRingMesh.position.set(cfg.ring.x, cfg.ring.y, cfg.ring.z);
    hotspotFocusRingMesh.scale.setScalar(cfg.ring.scale || 0.45);
    hotspotFocusRingMesh.rotation.set(0.28, 0, 0);
  } else {
    hotspotFocusRingMesh.visible = false;
  }

  const targetZ = cfg.key === 'general' ? getResponsiveCameraZ(cfg.cam.z) : cfg.cam.z;
  gsap.to(camera.position, {
    x: cfg.cam.x,
    y: cfg.cam.y,
    z: targetZ,
    duration: 0.72,
    ease: 'power2.out'
  });
  gsap.to(controls.target, {
    x: cfg.target.x,
    y: cfg.target.y,
    z: cfg.target.z,
    duration: 0.72,
    ease: 'power2.out'
  });

  showToast(`Hotspot 3D: ${cfg.label}`, 'sky');
}

function selectHardwareDevice(deviceId, focus3D = true) {
  const nodeObj = deviceNodes3D.get(deviceId);
  if (!nodeObj) return;

  usbAssemblyMode = false;
  activeDeviceId = deviceId;
  syncOnDemandLiveTelemetry(deviceId);

  const isMoboOrCpu = nodeObj.assetFile === 'placa-madre.glb' || nodeObj.assetFile === 'procesador.glb';
  const hotspotsBarEl = document.getElementById('mobo-hotspots-bar');
  if (hotspotsBarEl) {
    hotspotsBarEl.classList.toggle('hidden', !isMoboOrCpu);
    hotspotsBarEl.classList.toggle('flex', isMoboOrCpu);
  }
  if (!isMoboOrCpu) {
    hotspotFocusRingMesh.visible = false;
  } else {
    activeMoboHotspot = 'general';
    hotspotFocusRingMesh.visible = false;
    updateMoboHotspotButtonsUI();
  }

  if (currentPage === 'laboratorio') {
    if (labViewMode === 'INSPECTOR') {
      renderInspectorStageModel(nodeObj.assetFile, false);
      if (focus3D) {
        gsap.to(camera.position, {
          x: 0,
          y: 2.9,
          z: getResponsiveCameraZ(6.8),
          duration: 0.6,
          ease: 'power2.out'
        });
        gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power2.out' });
      }
    } else if (focus3D) {
      const pos = nodeObj.anchorGroup.position;
      gsap.to(controls.target, { x: pos.x * 0.8, y: pos.y, z: pos.z * 0.8, duration: 0.7, ease: 'power2.out' });
    }
  }

  for (const [id, n] of deviceNodes3D.entries()) {
    const isSel = id === deviceId;
    const scale = isSel ? 1.12 : 1.0;
    gsap.to(n.deviceRootGroup.scale, { x: scale, y: scale, z: scale, duration: 0.3 });
    n.orbitSpeed = isSel ? 0 : n.baseOrbitSpeed;
  }

  updateInspectorCardUI(deviceId);
  renderNavigationDeviceList();
}

function selectDeviceByGlbAsset(assetFile) {
  const normalized = assetFile === '2.5.glb' ? '.5.glb' : assetFile;
  for (const [id, nodeObj] of deviceNodes3D.entries()) {
    if (nodeObj.assetFile === normalized) {
      selectHardwareDevice(id, true);
      return;
    }
  }
}

function updateInspectorCardUI(deviceId) {
  const nodeObj = deviceNodes3D.get(deviceId);
  if (!nodeObj) return;

  const dev = nodeObj.deviceData;
  const isGamepad = dev.tipo === 'GAMEPAD' || nodeObj.assetFile === 'xbox_360_joystick_3d_scan.glb';
  const effectiveState = isGamepad && gamepadState.driftDetected ? 'CRITICO' : dev.estado || 'ESTABLE';
  const theme = STATUS_COLORS[effectiveState] || STATUS_COLORS.ESTABLE;

  const dotEl = document.getElementById('card-status-dot');
  const nameEl = document.getElementById('card-device-name');
  const ifaceEl = document.getElementById('card-device-interface');
  const badgeEl = document.getElementById('card-status-badge');
  const devIdEl = document.getElementById('card-device-id');
  const portIdEl = document.getElementById('card-port-id');
  const glbBadgeEl = document.getElementById('card-glb-badge');
  const metricsGridEl = document.getElementById('card-metrics-grid');
  const extraSpecsEl = document.getElementById('card-extra-specs');
  const actionBtnEl = document.getElementById('btn-card-action');

  if (dotEl) {
    dotEl.className = `w-2.5 h-2.5 rounded-full shrink-0 ${theme.glowClass}`;
    dotEl.style.backgroundColor = theme.css;
  }
  if (nameEl) {
    nameEl.textContent = isGamepad && gamepadState.physicalConnected ? gamepadState.controllerBrand : dev.nombre;
  }
  if (ifaceEl) ifaceEl.textContent = `${dev.tipo} • ${dev.interfaz || GLB_ASSET_SPECS[nodeObj.assetFile]?.label}`;
  if (badgeEl) {
    badgeEl.className = `px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badgeClass}`;
    badgeEl.textContent = theme.label;
  }
  if (devIdEl) devIdEl.textContent = `ID: ${nodeObj.deviceId}`;
  if (portIdEl) portIdEl.textContent = `Bus: ${dev.portId || nodeObj.deviceId}`;
  if (glbBadgeEl) glbBadgeEl.textContent = nodeObj.assetFile;

  let metrics = [];
  let extraHtml = '';

  const buildHotspotsInlineControlsHtml = () => `
    <div class="pt-1.5 border-t border-slate-800 space-y-1.5">
      <div class="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Hotspots 3D de Enfoque Suave:</div>
      <div class="flex flex-wrap gap-1.5">
        ${Object.values(MOTHERBOARD_HOTSPOTS)
          .map(
            h => `<button type="button" data-mobo-hotspot="${escapeHtml(h.key)}" class="${
              activeMoboHotspot === h.key ? 'studio-btn-active font-semibold' : 'studio-btn font-medium'
            } px-2 py-1 rounded-lg text-[10px] cursor-pointer">${escapeHtml(h.label)}</button>`
          )
          .join('')}
      </div>
    </div>
  `;

  if (nodeObj.assetFile === 'procesador.glb') {
    const cpu = dev.cpuSpecs || {};
    const moboElec = deviceNodes3D.get('CORE-MOBO')?.deviceData?.electricalChronology || {};
    const vcoreVal = Number(moboElec.voltageRails?.cpuVcoreV ?? 1.185).toFixed(3);
    metrics = [
      { label: 'Núcleos / Hilos', value: `${cpu.physicalCores ?? 8}C / ${cpu.threads ?? 16}T`, color: '#38bdf8' },
      { label: 'Base / Boost', value: `${cpu.baseSpeedMHz ?? 3400} / ${cpu.boostSpeedMHz ?? 4650} MHz`, color: '#f472b6' },
      { label: 'Reloj & Carga', value: `${cpu.currentSpeedMHz ?? 4120} MHz (${cpu.loadPct ?? 14}%)`, color: '#f8fafc' },
      { label: 'Temp & Vcore CPU', value: `${cpu.temperatureC ?? 45.2} °C • ${vcoreVal} V`, color: '#10b981' }
    ];
    const cores = (cpu.cores || []).slice(0, 8);
    extraHtml = `
      <div class="flex justify-between text-[11px] pb-1 border-b border-slate-800">
        <span class="text-slate-400">Arquitectura:</span>
        <span class="font-semibold text-white">${escapeHtml(cpu.manufacturer || 'x86_64')} ${escapeHtml(cpu.brand || '')}</span>
      </div>
      <div class="grid grid-cols-4 gap-1.5 pt-1">
        ${cores
          .map(
            c => `<div class="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
              <span class="text-[10px] text-slate-400 block">${escapeHtml(c.shortLabel)}</span>
              <span class="num-mono text-[11px] font-bold text-sky-300">${c.tempC}°C</span>
            </div>`
          )
          .join('')}
      </div>
      ${buildHotspotsInlineControlsHtml()}
    `;
  } else if (nodeObj.assetFile === 'ram.glb') {
    const ram = dev.ramSpecs || {};
    metrics = [
      { label: 'Capacidad Total', value: `${ram.totalPhysicalGB ?? 32} GB DDR4`, color: '#38bdf8' },
      { label: 'Velocidad Bus', value: `${ram.clockSpeedMHz ?? 3200} MHz`, color: '#c084fc' },
      { label: 'Canales Activos', value: ram.channelConfig || 'Dual-Channel (2x16GB)', color: '#10b981' },
      { label: 'Uso Memoria OS', value: `${ram.activeUsedGB ?? 9.4} GB (${ram.usedPct ?? 29}%)`, color: '#f8fafc' }
    ];
    extraHtml = (ram.modules || [])
      .map(
        m => `<div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
          <span class="font-semibold text-sky-300">${escapeHtml(m.bank)}</span>
          <span class="num-mono text-white">${m.sizeGB}GB ${escapeHtml(m.type)} @ ${m.clockSpeedMHz}MHz</span>
        </div>`
      )
      .join('');
  } else if (nodeObj.assetFile === 'placa-madre.glb') {
    const mobo = dev.moboSpecs || {};
    const elec = dev.electricalChronology || {};
    const rails = elec.voltageRails || {};
    const minUsbVbus = Number(currentTelemetry?.summary?.minUsbVbus ?? rails.rail5VVbus ?? 5.02);
    const rail12V = Number(rails.rail12V ?? elec.voltageNowV ?? 12.08).toFixed(2);
    const rail5VVbus = Number(minUsbVbus).toFixed(2);
    const rail3V3 = Number(rails.rail3V3 ?? 3.31).toFixed(2);
    const cpuVcoreV = Number(rails.cpuVcoreV ?? 1.185).toFixed(3);

    metrics = [
      { label: 'Línea +12V ATX', value: `${rail12V} V (Nominal)`, color: '#38bdf8' },
      { label: '+5V VBUS / +3.3V', value: `${rail5VVbus} V / ${rail3V3} V`, color: minUsbVbus < 4.75 ? '#f43f5e' : '#10b981' },
      { label: 'Vcore CPU (VRM)', value: `${cpuVcoreV} V • ${mobo.chipsetTempC ?? 41.5} °C`, color: '#f472b6' },
      { label: 'Energía AC/Batería', value: liveBatteryState.statusLabel, color: '#f8fafc' }
    ];
    const gpus = mobo.gpus || [];
    extraHtml = `
      <div class="grid grid-cols-2 gap-1.5 text-[11px]">
        <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <span class="text-slate-400">Línea +12V:</span>
          <span class="num-mono font-bold text-sky-300">${rail12V} V</span>
        </div>
        <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <span class="text-slate-400">+5V VBUS:</span>
          <span class="num-mono font-bold text-emerald-300">${rail5VVbus} V</span>
        </div>
        <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <span class="text-slate-400">Línea +3.3V:</span>
          <span class="num-mono font-bold text-purple-300">${rail3V3} V</span>
        </div>
        <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
          <span class="text-slate-400">Vcore CPU:</span>
          <span class="num-mono font-bold text-pink-300">${cpuVcoreV} V</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-[11px]">
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Estado AC/Batería (getBattery):</span>
          <span class="num-mono font-semibold text-emerald-300">${escapeHtml(liveBatteryState.statusLabel)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-400">GPU WebGL Real (Unmasked):</span>
          <span class="num-mono text-[10px] text-sky-300 truncate max-w-[185px]" title="${escapeHtml(detectedWebglGpu.renderer)}">${escapeHtml(detectedWebglGpu.renderer)}</span>
        </div>
      </div>
      ${gpus
        .map(
          g => `<div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5 text-[11px]">
            <div class="font-semibold text-white truncate">${escapeHtml(g.model)}</div>
            <div class="num-mono text-[10px] text-sky-300">${escapeHtml(g.vramLabel)} • PCIe ${escapeHtml(g.busAddress)}</div>
          </div>`
        )
        .join('')}
      ${buildHotspotsInlineControlsHtml()}
    `;
  } else if (dev.smart) {
    const s = dev.smart;
    const isRealLocalDisk =
      Boolean(dev.isPhysicalHardware || s.isPhysicalHardware) &&
      String(s.realNodePath || s.devicePath || '').startsWith('/dev/');
    const isNvmeCatalogModel = nodeObj.assetFile === 'ssd970evo.glb' || nodeObj.assetFile === 'ssd-corsair.glb';
    const isLinkedToLocalNvme = !isRealLocalDisk && isNvmeCatalogModel && linkReferenceNvmeToPrimary && Boolean(primaryLocalNvmeSmart);
    const isSimulatingRef = !isRealLocalDisk && !isLinkedToLocalNvme && simulateReferenceStorageTelemetry;

    if (isRealLocalDisk || isLinkedToLocalNvme) {
      const realData = isLinkedToLocalNvme ? primaryLocalNvmeSmart : s;
      const nodePath = realData.realNodePath || realData.devicePath || '/dev/nvme0n1';
      const badgeLabel = isRealLocalDisk ? 'HARDWARE LOCAL DETECTADO' : 'VINCULADO A NVMe LOCAL (/dev/nvme0n1)';
      if (badgeEl) {
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-500/15 text-emerald-300 border-emerald-400/40';
        badgeEl.textContent = badgeLabel;
      }
      if (portIdEl) portIdEl.textContent = `Nodo Real: ${nodePath}`;

      metrics = [
        { label: 'Estado Hardware', value: 'HARDWARE LOCAL DETECTADO', color: '#10b981' },
        { label: 'Temperatura Real', value: `${realData.temperatureC ?? 35} °C`, color: '#38bdf8' },
        { label: 'Nodo Físico Real', value: `${nodePath} (${realData.size || '476.9 GB'})`, color: '#f8fafc' },
        { label: 'Uso Acumulado', value: `${realData.powerOnHours ?? 1} h (Reales)`, color: '#f472b6' }
      ];
      extraHtml = `
        <div class="p-2 rounded-xl bg-emerald-950/35 border border-emerald-500/40 flex items-center justify-between text-[11px]">
          <span class="font-bold text-emerald-300 num-mono">✓ ${escapeHtml(badgeLabel)}</span>
          <span class="num-mono text-white">${escapeHtml(nodePath)}</span>
        </div>
        <div class="flex justify-between text-[11px]"><span class="text-slate-400">Unidad Física:</span><span class="num-mono text-white font-semibold">${escapeHtml(realData.model || dev.nombre)}</span></div>
        <div class="flex justify-between text-[11px]"><span class="text-slate-400">Power-On Hours Reales:</span><span class="num-mono text-sky-300 font-bold">${realData.powerOnHours ?? 1} h (${realData.powerCycles ?? 1} ciclos)</span></div>
        <div class="flex justify-between text-[11px]"><span class="text-slate-400">Serial / FW:</span><span class="num-mono text-slate-300">${escapeHtml(realData.serial || 'N/A')} • ${escapeHtml(realData.firmware || 'N/A')}</span></div>
        <div class="flex justify-between text-[11px]"><span class="text-slate-400">Salud S.M.A.R.T. &amp; CRC:</span><span class="num-mono text-emerald-300">${escapeHtml(realData.health || 'PASSED')} • ${realData.crcErrors ?? 0} CRC</span></div>
        ${
          !isRealLocalDisk
            ? `<div class="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Vínculo NVMe Principal:</span>
                <button type="button" data-toggle-nvme-link="true" class="studio-btn-active px-2 py-0.5 rounded-lg text-[10px] num-mono cursor-pointer">Desvincular (Ver Modelo 3D)</button>
              </div>`
            : ''
        }
      `;
    } else if (isSimulatingRef) {
      const preset = s.simulatedPreset || {
        devicePath: '/dev/sim0 (Simulado)',
        model: dev.nombre,
        health: 'PASSED (Simulado)',
        temperatureC: 37,
        powerOnHours: 320,
        size: '1.0 TB (Simulado)',
        serial: 'SIM-3D-TEST',
        firmware: 'SIM-1.0',
        bufferedReadMBps: 3400
      };
      if (badgeEl) {
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-500/15 text-amber-300 border-amber-400/40';
        badgeEl.textContent = 'TELEMETRÍA DE PRUEBA (SIMULADA)';
      }
      metrics = [
        { label: 'Estado Modelo 3D', value: 'SIMULACIÓN DE PRUEBA', color: '#f59e0b' },
        { label: 'Temperatura (Sim)', value: `${preset.temperatureC} °C (Simulado)`, color: '#38bdf8' },
        { label: 'Lectura Seq. (Sim)', value: `${preset.bufferedReadMBps} MB/s`, color: '#f8fafc' },
        { label: 'Uso Acumulado', value: `${preset.powerOnHours} h (Simulado)`, color: '#f472b6' }
      ];
      extraHtml = `
        <div class="p-2 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between text-[11px]">
          <span class="font-bold text-amber-300 num-mono">MODO SIMULACIÓN DE PRUEBA ACTIVO</span>
          <span class="num-mono text-zinc-300">assets/${escapeHtml(nodeObj.assetFile)}</span>
        </div>
        <div class="flex justify-between text-[11px]"><span class="text-slate-400">Nodo Simulado:</span><span class="num-mono text-white">${escapeHtml(preset.devicePath)} (${escapeHtml(preset.size)})</span></div>
        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
          <label class="inline-flex items-center gap-1.5 cursor-pointer text-zinc-200">
            <input type="checkbox" data-inline-sim-storage="true" checked class="w-3.5 h-3.5 accent-sky-400 rounded cursor-pointer" />
            <span>Simular telemetría de prueba</span>
          </label>
          ${
            isNvmeCatalogModel
              ? `<button type="button" data-toggle-nvme-link="true" class="studio-btn px-2 py-0.5 rounded-lg text-[10px] num-mono cursor-pointer">Vincular mi NVMe real</button>`
              : ''
          }
        </div>
      `;
    } else {
      // Modelo 3D del catálogo no conectado físicamente: NO inventar horas registradas
      if (badgeEl) {
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-zinc-800 text-zinc-200 border-zinc-600';
        badgeEl.textContent = 'MODELO 3D DE REFERENCIA';
      }
      if (portIdEl) portIdEl.textContent = 'Estado: No montado (Catálogo 3D)';

      metrics = [
        { label: 'Estado Unidad', value: 'MODELO 3D DE REFERENCIA', color: '#38bdf8' },
        { label: 'Temperatura', value: '-- °C (No montado)', color: '#a1a1aa' },
        { label: 'Nodo en Sistema', value: 'No montado (Catálogo 3D)', color: '#f8fafc' },
        { label: 'Uso Acumulado', value: '0 h (No montado)', color: '#f472b6' }
      ];
      extraHtml = `
        <div class="p-2 rounded-xl bg-slate-900/95 border border-slate-700 flex items-center justify-between text-[11px]">
          <span class="font-bold text-sky-300 num-mono">MODELO 3D DE REFERENCIA</span>
          <span class="num-mono text-zinc-300">0 h (No montado)</span>
        </div>
        <div class="text-[11px] text-slate-300 leading-relaxed">
          Esta unidad (<code class="num-mono text-white">assets/${escapeHtml(nodeObj.assetFile)}</code>) pertenece al catálogo 3D y no está físicamente montada en un nodo <code class="num-mono text-sky-300">/dev/</code>.
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1.5 border-t border-slate-800">
          <label class="inline-flex items-center gap-1.5 cursor-pointer text-zinc-200">
            <input type="checkbox" data-inline-sim-storage="true" class="w-3.5 h-3.5 accent-sky-400 rounded cursor-pointer" />
            <span>Simular telemetría de prueba</span>
          </label>
          ${
            isNvmeCatalogModel
              ? `<button type="button" data-toggle-nvme-link="true" class="studio-btn px-2 py-0.5 rounded-lg text-[10px] num-mono cursor-pointer">Vincular NVMe Local (/dev/nvme0n1)</button>`
              : ''
          }
        </div>
      `;
    }
  } else if (isGamepad) {
    metrics = [
      {
        label: 'Estado Stick Drift',
        value: gamepadState.driftDetected ? 'DRIFT > 0.08' : 'OK (≤ 0.08)',
        color: gamepadState.driftDetected ? '#f43f5e' : '#10b981'
      },
      { label: 'Modelo Referencia', value: 'Krom KLOUD', color: '#f472b6' },
      { label: 'Polling & Jitter', value: `${gamepadState.pollingRateHz}Hz (${gamepadState.pollingJitterMs}ms)`, color: '#38bdf8' },
      { label: 'Conexión HID', value: gamepadState.physicalConnected ? 'Físico Activo' : 'Listo / Demo', color: '#f8fafc' }
    ];
    extraHtml = `
      <div class="flex justify-between text-[11px]"><span class="text-slate-400">Código Hardware:</span><span class="num-mono text-pink-300 font-semibold">NXKROMKLD</span></div>
      <div class="flex justify-between text-[11px]"><span class="text-slate-400">API Navegador:</span><span class="num-mono text-sky-300">navigator.getGamepads()</span></div>
    `;
  } else {
    const vbus = Number(dev.voltaje_vbus ?? 5.0);
    metrics = [
      { label: 'Voltaje VBUS', value: `${vbus.toFixed(2)} V`, color: vbus < 4.75 ? '#f43f5e' : '#10b981' },
      { label: 'Interfaz Bus', value: dev.subtipo || 'USB 3.2', color: '#38bdf8' },
      { label: 'Latencia Resp.', value: `${Number(dev.latencia_ms ?? 0.8).toFixed(2)} ms`, color: '#f8fafc' },
      { label: 'Polling Bus', value: `${dev.pollingRateHz ?? 1000} Hz`, color: '#f472b6' }
    ];
    extraHtml = `
      <div class="text-[11px] text-slate-300 num-mono break-all">${escapeHtml(dev.bus_info || 'USB Root Topology Nominal')}</div>
    `;
  }

  if (metricsGridEl) {
    metricsGridEl.innerHTML = metrics
      .map(
        m => `<div class="p-2.5 rounded-2xl bg-[#060911]/85 border border-slate-800/90">
          <span class="text-[10px] text-slate-400 block">${escapeHtml(m.label)}</span>
          <span class="num-mono text-xs font-bold block mt-0.5 truncate" style="color:${m.color}">${escapeHtml(m.value)}</span>
        </div>`
      )
      .join('');
  }
  if (extraSpecsEl) {
    extraSpecsEl.innerHTML = extraHtml;
    extraSpecsEl.querySelectorAll('[data-mobo-hotspot]').forEach(btn => {
      btn.addEventListener('click', () => {
        focusMotherboardHotspot(btn.getAttribute('data-mobo-hotspot') || 'general');
      });
    });
    extraSpecsEl.querySelectorAll('[data-inline-sim-storage]').forEach(chk => {
      chk.addEventListener('change', e => {
        simulateReferenceStorageTelemetry = Boolean(e.target.checked);
        const topToggle = document.getElementById('toggle-sim-storage-telemetry');
        if (topToggle) topToggle.checked = simulateReferenceStorageTelemetry;
        updateInspectorCardUI(activeDeviceId);
        renderNavigationDeviceList();
      });
    });
    extraSpecsEl.querySelectorAll('[data-toggle-nvme-link]').forEach(btn => {
      btn.addEventListener('click', () => {
        linkReferenceNvmeToPrimary = !linkReferenceNvmeToPrimary;
        updateInspectorCardUI(activeDeviceId);
        renderNavigationDeviceList();
      });
    });
  }

  if (actionBtnEl) {
    if (isGamepad) {
      actionBtnEl.innerHTML = `<span>${gamepadState.demoModeEnabled ? 'Detener Demo Mando' : 'Probar Ejes Krom KLOUD'}</span><span class="pill-arrow">→</span>`;
      actionBtnEl.onclick = () => toggleGamepadDemoMode();
    } else {
      actionBtnEl.innerHTML = `<span>Centrar Cámara 3D</span><span class="pill-arrow">→</span>`;
      actionBtnEl.onclick = () => selectHardwareDevice(nodeObj.deviceId, true);
    }
  }
}

function renderNavigationDeviceList() {
  const listEl = document.getElementById('minimal-devices-list');
  if (!listEl) return;

  const filterForModels = activeCategoryFilter === 'DISPLAY' ? 'ALL' : activeCategoryFilter;
  const nodes = Array.from(deviceNodes3D.values()).filter(
    n => filterForModels === 'ALL' || n.category === filterForModels
  );

  listEl.innerHTML = nodes
    .map(n => {
      const isSelected = !usbAssemblyMode && activeDeviceId === n.deviceId;
      const isCrit =
        n.deviceData?.estado === 'CRITICO' ||
        (n.assetFile === 'xbox_360_joystick_3d_scan.glb' && gamepadState.driftDetected);
      const isStorage = n.deviceData?.tipo === 'STORAGE' || Boolean(n.deviceData?.smart);
      const isRealDisk =
        isStorage &&
        Boolean(n.deviceData?.isPhysicalHardware || n.deviceData?.smart?.isPhysicalHardware) &&
        String(n.deviceData?.smart?.realNodePath || n.deviceData?.smart?.devicePath || '').startsWith('/dev/');

      const dotColor = isCrit ? '#f43f5e' : isRealDisk ? '#10b981' : '#38bdf8';
      let tagText = n.modelLoadFailed ? 'Aviso' : '3D GLB';
      let tagColorClass = 'text-slate-400';

      if (isStorage) {
        if (isRealDisk) {
          tagText = 'HARDWARE LOCAL';
          tagColorClass = 'text-emerald-300 font-semibold';
        } else if (simulateReferenceStorageTelemetry) {
          tagText = 'SIMULADO';
          tagColorClass = 'text-amber-300';
        } else {
          tagText = '0 h (No montado)';
          tagColorClass = 'text-zinc-400';
        }
      }

      return `
        <button
          type="button"
          data-select-device="${escapeHtml(n.deviceId)}"
          class="glb-selector-card ${isSelected ? 'is-selected' : ''} p-2.5 rounded-2xl text-left cursor-pointer flex flex-col justify-between gap-1"
        >
          <div class="flex items-center justify-between gap-2 w-full">
            <span class="text-xs font-semibold text-white truncate">${escapeHtml(n.deviceData.nombre)}</span>
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color:${dotColor}"></span>
          </div>
          <div class="flex items-center justify-between gap-1 w-full text-[10px]">
            <span class="num-mono text-sky-300 truncate">assets/${escapeHtml(n.assetFile)}</span>
            <span class="${tagColorClass} num-mono shrink-0">${escapeHtml(tagText)}</span>
          </div>
        </button>
      `;
    })
    .join('');

  listEl.querySelectorAll('[data-select-device]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectHardwareDevice(btn.getAttribute('data-select-device'), true);
    });
  });
}

// ============================================================================
// 7. LECTURA EN VIVO DE GAMEPAD API (navigator.getGamepads()) & HID POLLING
// ============================================================================
window.addEventListener('gamepadconnected', e => {
  gamepadState.physicalConnected = true;
  gamepadState.controllerBrand = e.gamepad?.id || 'Gamepad Krom KLOUD (NXKROMKLD)';
  showToast(`Gamepad conectado: ${gamepadState.controllerBrand}`, 'emerald');
});

window.addEventListener('gamepaddisconnected', () => {
  gamepadState.physicalConnected = false;
  gamepadState.driftDetected = false;
  gamepadState.driftingAxes = [];
});

function scanGamepadsAndUpdateHUD(elapsed) {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let activePad = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      activePad = pads[i];
      break;
    }
  }

  if (activePad) {
    gamepadState.physicalConnected = true;
    gamepadState.controllerBrand = activePad.id || 'Krom KLOUD (NXKROMKLD)';
    const ts = Number(activePad.timestamp || performance.now());
    if (gamepadState.lastSampleTimestamp > 0 && ts > gamepadState.lastSampleTimestamp) {
      const dt = ts - gamepadState.lastSampleTimestamp;
      if (dt > 0.5 && dt < 120) {
        gamepadState.pollingDeltas.push(dt);
        if (gamepadState.pollingDeltas.length > 20) gamepadState.pollingDeltas.shift();
        const avg = gamepadState.pollingDeltas.reduce((a, b) => a + b, 0) / gamepadState.pollingDeltas.length;
        gamepadState.pollingRateHz = Math.min(1000, Math.max(60, Math.round(1000 / avg)));
      }
    }
    gamepadState.lastSampleTimestamp = ts;

    for (let a = 0; a < 4; a++) {
      gamepadState.prevAxes[a] = gamepadState.axes[a];
      let val = activePad.axes[a] ?? 0;
      if (gamepadState.simulatedDriftActive && a === gamepadState.simulatedDriftAxis) {
        val = gamepadState.simulatedDriftValue + Math.sin(elapsed * 18) * 0.004;
      }
      gamepadState.axes[a] = Number(val.toFixed(4));
    }
    for (let b = 0; b < 17; b++) {
      const btn = activePad.buttons[b];
      gamepadState.buttons[b] = btn ? { pressed: Boolean(btn.pressed), value: Number((btn.value || 0).toFixed(2)) } : { pressed: false, value: 0 };
    }
  } else {
    gamepadState.physicalConnected = false;
    for (let a = 0; a < 4; a++) {
      gamepadState.prevAxes[a] = gamepadState.axes[a];
      if (gamepadState.simulatedDriftActive && a === gamepadState.simulatedDriftAxis) {
        gamepadState.axes[a] = Number((gamepadState.simulatedDriftValue + Math.sin(elapsed * 20) * 0.005).toFixed(4));
      } else if (gamepadState.demoModeEnabled) {
        if (a === 0) gamepadState.axes[0] = Number((Math.cos(elapsed * 2.1) * 0.65).toFixed(4));
        if (a === 1) gamepadState.axes[1] = Number((Math.sin(elapsed * 2.1) * 0.65).toFixed(4));
        if (a === 2) gamepadState.axes[2] = Number((Math.sin(elapsed * 1.6) * 0.55).toFixed(4));
        if (a === 3) gamepadState.axes[3] = Number((Math.cos(elapsed * 1.6) * 0.55).toFixed(4));
      } else {
        gamepadState.axes[a] = 0;
      }
    }
    for (let b = 0; b < 17; b++) {
      if (gamepadState.demoModeEnabled && (b === 6 || b === 7)) {
        const v = Math.max(0, Math.sin(elapsed * 2.4 + (b === 7 ? 1.4 : 0)));
        gamepadState.buttons[b] = { pressed: v > 0.2, value: Number(v.toFixed(2)) };
      } else {
        gamepadState.buttons[b] = { pressed: false, value: 0 };
      }
    }
  }

  const anyBtn = gamepadState.buttons.some(b => b.pressed || b.value > 0.1);
  const labels = ['LX', 'LY', 'RX', 'RY'];
  const drifting = [];

  for (let a = 0; a < 4; a++) {
    const val = gamepadState.axes[a];
    const abs = Math.abs(val);
    const delta = Math.abs(val - gamepadState.prevAxes[a]);
    const candidate =
      !gamepadState.demoModeEnabled &&
      !anyBtn &&
      abs > DEADZONE_THRESHOLD &&
      (gamepadState.simulatedDriftActive || (abs < 0.45 && delta < 0.035));

    if (candidate) {
      gamepadState.axisDriftTimers[a] = Math.min(100, gamepadState.axisDriftTimers[a] + 1);
    } else if (abs <= DEADZONE_THRESHOLD) {
      gamepadState.axisDriftTimers[a] = 0;
    }

    if ((gamepadState.simulatedDriftActive && abs > DEADZONE_THRESHOLD) || gamepadState.axisDriftTimers[a] >= 12) {
      drifting.push({ index: a, label: labels[a], value: val });
    }
  }

  const prevDrift = gamepadState.driftDetected;
  gamepadState.driftDetected = drifting.length > 0;
  gamepadState.driftingAxes = drifting;

  const [lx, ly, rx, ry] = gamepadState.axes;
  if (hologramDomNodes.leftStick) {
    hologramDomNodes.leftStick.style.transform = `translate(${(lx * STICK_MAX_TRANSLATE_PX).toFixed(1)}px, ${(ly * STICK_MAX_TRANSLATE_PX).toFixed(1)}px)`;
  }
  if (hologramDomNodes.rightStick) {
    hologramDomNodes.rightStick.style.transform = `translate(${(rx * STICK_MAX_TRANSLATE_PX).toFixed(1)}px, ${(ry * STICK_MAX_TRANSLATE_PX).toFixed(1)}px)`;
    const rightAlert = drifting.some(d => d.index === 2 || d.index === 3);
    hologramDomNodes.rightStick.style.backgroundColor = rightAlert ? '#f43f5e' : '#38bdf8';
  }

  const lt = gamepadState.buttons[6]?.value || 0;
  const rt = gamepadState.buttons[7]?.value || 0;
  if (hologramDomNodes.leftTrigger) hologramDomNodes.leftTrigger.style.transform = `translateY(${(lt * 5).toFixed(1)}px)`;
  if (hologramDomNodes.rightTrigger) hologramDomNodes.rightTrigger.style.transform = `translateY(${(rt * 5).toFixed(1)}px)`;
  if (hologramDomNodes.img) hologramDomNodes.img.classList.toggle('drift-alert', gamepadState.driftDetected);

  const axesEl = document.getElementById('gamepad-axes-summary');
  const trigEl = document.getElementById('gamepad-triggers-summary');
  const verdictEl = document.getElementById('deadzone-verdict-badge');
  const bannerEl = document.getElementById('drift-critical-banner');
  const bannerTxtEl = document.getElementById('drift-banner-text');

  if (axesEl) axesEl.textContent = `L: ${lx.toFixed(2)}, ${ly.toFixed(2)} | R: ${rx.toFixed(2)}, ${ry.toFixed(2)}`;
  if (trigEl) trigEl.textContent = `LT: ${lt.toFixed(2)} | RT: ${rt.toFixed(2)}`;

  if (gamepadState.driftDetected && drifting[0]) {
    bannerEl?.classList.remove('hidden');
    if (bannerTxtEl) {
      bannerTxtEl.textContent = `Stick Drift Detectado en Krom KLOUD — Eje ${drifting[0].label}: ${drifting[0].value.toFixed(3)} (> 0.08)`;
    }
    if (verdictEl) {
      verdictEl.textContent = `DRIFT (${drifting[0].label}: ${drifting[0].value.toFixed(2)})`;
      verdictEl.style.color = '#f43f5e';
    }
  } else {
    bannerEl?.classList.add('hidden');
    if (verdictEl) {
      verdictEl.textContent = 'Deadzone OK (≤0.08)';
      verdictEl.style.color = '#38bdf8';
    }
  }

  if (prevDrift !== gamepadState.driftDetected) {
    if (activeDeviceId === 'HID-GAMEPAD') updateInspectorCardUI('HID-GAMEPAD');
    renderNavigationDeviceList();
  }
}

// Monitor HID Polling Rate (Mouse y Teclado)
const inputPolling = { lastMouse: 0, mouseHz: 0, deltaMs: null, lastKey: 0, keyHz: 0 };
window.addEventListener(
  'mousemove',
  e => {
    const now = performance.now();
    if (inputPolling.lastMouse > 0) {
      const dt = now - inputPolling.lastMouse;
      if (dt > 0.2 && dt < 200) {
        inputPolling.deltaMs = dt;
        inputPolling.mouseHz = Math.min(2000, Math.round(1000 / dt));
      }
    }
    inputPolling.lastMouse = now;
    // Paralaje espacial suave
    parallaxTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
    parallaxTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
  },
  { passive: true }
);

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
  const now = performance.now();
  if (inputPolling.lastKey > 0) {
    const dt = now - inputPolling.lastKey;
    if (dt > 1 && dt < 450) inputPolling.keyHz = Math.min(1000, Math.round(1000 / dt));
  }
  inputPolling.lastKey = now;
});

setInterval(() => {
  const now = performance.now();
  if (now - inputPolling.lastMouse > 280) inputPolling.mouseHz = 0;
  if (now - inputPolling.lastKey > 500) inputPolling.keyHz = 0;
  const mEl = document.getElementById('mouse-polling-hz');
  const kEl = document.getElementById('kb-polling-hz');
  const dEl = document.getElementById('mouse-delta-ms');
  if (mEl) mEl.textContent = `${inputPolling.mouseHz} Hz`;
  if (kEl) kEl.textContent = `${inputPolling.keyHz} Hz`;
  if (dEl) dEl.textContent = inputPolling.deltaMs ? `Δt: ${inputPolling.deltaMs.toFixed(1)} ms` : 'Δt: -- ms';
}, 220);

// ============================================================================
// 8. RAYCASTER EN MODO SISTEMA SOLAR Y BUCLE 3D A 60 FPS CONSTANTES
// ============================================================================
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const parallaxTarget = { x: 0, y: 0 };
const parallaxCurrent = { x: 0, y: 0 };
let pointerDownInfo = { x: 0, y: 0 };

interactiveMountEl?.addEventListener('pointerdown', e => {
  pointerDownInfo = { x: e.clientX, y: e.clientY };
});

interactiveMountEl?.addEventListener('pointerup', e => {
  if (currentPage !== 'laboratorio' || labViewMode !== 'SOLAR') return;
  if (Math.hypot(e.clientX - pointerDownInfo.x, e.clientY - pointerDownInfo.y) > 8) return;

  const rect = interactiveMountEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  const roots = [];
  for (const n of deviceNodes3D.values()) {
    if (n.anchorGroup.visible && n.modelLoaded) roots.push(n.deviceRootGroup);
  }
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(roots, true);
  if (hits.length > 0) {
    let curr = hits[0].object;
    while (curr) {
      if (curr.userData?.isDeviceRoot && curr.userData.deviceId) {
        selectHardwareDevice(curr.userData.deviceId, true);
        break;
      }
      curr = curr.parent;
    }
  }
});

const clock = new THREE.Clock();
let isRenderLoopPaused = false;

// Pausar automáticamente el ciclo de renderizado pesado de Three.js cuando el usuario cambie de pestaña (document.hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isRenderLoopPaused = true;
    clock.stop();
  } else {
    isRenderLoopPaused = false;
    clock.start();
  }
});

// ============================================================================
// MEJORA 3: TELEMETRÍA EN TIEMPO REAL DE PANTALLA / PANEL (HZ REALES & FRAME TIME)
// ============================================================================
const displayTelemetryState = {
  lastRafTimestamp: 0,
  frameDeltasMs: [],
  liveHz: 60,
  frameTimeMs: 16.67,
  lastDomUpdateAt: 0
};

function computeGreatestCommonDivisor(a, b) {
  let x = Math.abs(Math.round(a)) || 1;
  let y = Math.abs(Math.round(b)) || 1;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function getScreenAspectRatioLabel(w, h) {
  if (!w || !h) return '16:9';
  const gcd = computeGreatestCommonDivisor(w, h);
  const rw = Math.round(w / gcd);
  const rh = Math.round(h / gcd);
  if (rw > 64 || rh > 64) {
    const ratio = w / h;
    if (Math.abs(ratio - 16 / 9) < 0.04) return '16:9';
    if (Math.abs(ratio - 16 / 10) < 0.04) return '16:10';
    if (Math.abs(ratio - 21 / 9) < 0.06) return '21:9';
    return `${ratio.toFixed(2)}:1`;
  }
  return `${rw}:${rh}`;
}

function updateDisplayDiagnosticsDOM() {
  const sw = window.screen?.width || window.innerWidth || 1920;
  const sh = window.screen?.height || window.innerHeight || 1080;
  const dpr = Number((window.devicePixelRatio || 1).toFixed(2));
  const cDepth = window.screen?.colorDepth || 24;
  const bpcLabel = cDepth >= 30 ? '10 bpc HDR' : '8 bpc sRGB';
  const aspectLabel = getScreenAspectRatioLabel(sw, sh);
  const hzText = `${displayTelemetryState.liveHz} Hz`;
  const ftText = `${displayTelemetryState.frameTimeMs.toFixed(2)} ms`;
  const resText = `${sw} × ${sh} px (${dpr}x)`;
  const depthText = `${cDepth}-bit (${bpcLabel})`;

  const hzEl = document.getElementById('display-live-hz');
  const ftEl = document.getElementById('display-frame-time-ms');
  const resEl = document.getElementById('display-native-res');
  const depthEl = document.getElementById('display-color-depth');
  const aspectEl = document.getElementById('display-aspect-ratio');
  const gpuEl = document.getElementById('display-webgl-gpu');

  if (hzEl) hzEl.textContent = hzText;
  if (ftEl) ftEl.textContent = ftText;
  if (resEl) resEl.textContent = resText;
  if (depthEl) depthEl.textContent = depthText;
  if (aspectEl) aspectEl.textContent = `${aspectLabel} (${(sw / Math.max(1, sh)).toFixed(2)}:1)`;
  if (gpuEl && detectedWebglGpu.renderer) {
    gpuEl.textContent = `${detectedWebglGpu.renderer} (${detectedWebglGpu.vendor})`;
  }

  document.querySelectorAll('[data-service-display-hz]').forEach(el => {
    el.textContent = `${hzText} (En Vivo)`;
  });
  document.querySelectorAll('[data-service-display-ft]').forEach(el => {
    el.textContent = ftText;
  });
  document.querySelectorAll('[data-service-display-res]').forEach(el => {
    el.textContent = `${sw} × ${sh} px`;
  });
  document.querySelectorAll('[data-service-display-depth]').forEach(el => {
    el.textContent = depthText;
  });
  document.querySelectorAll('[data-service-display-aspect]').forEach(el => {
    el.textContent = `${aspectLabel} • DPR ${dpr}x`;
  });
}

function recordDisplayFrameDelta(rafNow) {
  const ts = typeof rafNow === 'number' ? rafNow : performance.now();
  if (displayTelemetryState.lastRafTimestamp > 0) {
    const dt = ts - displayTelemetryState.lastRafTimestamp;
    if (dt > 1.5 && dt < 120) {
      displayTelemetryState.frameDeltasMs.push(dt);
      if (displayTelemetryState.frameDeltasMs.length > 45) {
        displayTelemetryState.frameDeltasMs.shift();
      }
      const sum = displayTelemetryState.frameDeltasMs.reduce((a, b) => a + b, 0);
      const avgDt = sum / displayTelemetryState.frameDeltasMs.length;
      displayTelemetryState.frameTimeMs = avgDt;
      displayTelemetryState.liveHz = Math.max(1, Math.min(540, Math.round(1000 / avgDt)));
    }
  }
  displayTelemetryState.lastRafTimestamp = ts;

  if (ts - displayTelemetryState.lastDomUpdateAt > 260) {
    displayTelemetryState.lastDomUpdateAt = ts;
    updateDisplayDiagnosticsDOM();
  }
}

function animate3D(rafTimestamp) {
  requestAnimationFrame(animate3D);
  if (document.hidden || isRenderLoopPaused) return;

  recordDisplayFrameDelta(rafTimestamp);
  const elapsed = clock.getElapsedTime();

  parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.05;
  parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.05;

  // Rotación y paralaje del campo estelar atenuado
  starFieldPoints.rotation.y = elapsed * 0.012 + parallaxCurrent.x * 0.05;
  starFieldPoints.rotation.x = parallaxCurrent.y * 0.03;

  // Determinar si hay un visor 3D interactivo visible en pantalla (Inicio o Laboratorio 3D)
  const hasForegroundStage = currentPage === 'inicio' || currentPage === 'laboratorio';
  let stageRect = null;
  let isStageOnScreen = false;

  if (hasForegroundStage && interactiveMountEl) {
    stageRect = interactiveMountEl.getBoundingClientRect();
    isStageOnScreen =
      stageRect.width > 20 &&
      stageRect.height > 20 &&
      stageRect.bottom > 0 &&
      stageRect.top < window.innerHeight;
  }

  // Mostrar placa-madre.glb ambiental en el fondo espacial cuando el visor principal no está en pantalla
  bgMoboGroup.visible = !isStageOnScreen;
  if (bgMoboGroup.visible) {
    bgMoboGroup.rotation.y = elapsed * 0.16 + parallaxCurrent.x * 0.22;
    bgMoboGroup.rotation.x = parallaxCurrent.y * 0.12;
  }

  scanGamepadsAndUpdateHUD(elapsed);

  // PASS 1: Fondo espacial completo (#060911 + estrellas atenuadas 0.45 + placa-madre ambiental)
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.autoClear = true;
  renderer.render(bgScene, bgCamera);

  // PASS 2: Visor 3D recortado con nitidez nativa (Hero en #inicio o Inspector/Solar en #laboratorio)
  if (isStageOnScreen && stageRect) {
    controls.update();

    if (inspectorStageGroup.visible) {
      if (autoOrbitEnabled) {
        inspectorModelHolder.rotation.y = elapsed * 0.32 + parallaxCurrent.x * 0.18;
      }
      inspectorModelHolder.position.y = Math.sin(elapsed * 1.4) * 0.06;

      if (hotspotFocusRingMesh.visible) {
        hotspotFocusRingMesh.material.opacity = 0.52 + Math.sin(elapsed * 4.5) * 0.26;
      }

      if (
        currentInspectorAssetKey === 'xbox_360_joystick_3d_scan.glb' &&
        (gamepadState.physicalConnected || gamepadState.demoModeEnabled || gamepadState.simulatedDriftActive)
      ) {
        const [lx, ly, rx] = gamepadState.axes;
        inspectorModelHolder.rotation.z = -(lx + rx) * 0.18;
        inspectorModelHolder.rotation.x = ly * 0.18;
      } else if (autoOrbitEnabled) {
        inspectorModelHolder.rotation.x = parallaxCurrent.y * 0.08;
        inspectorModelHolder.rotation.z = 0;
      }
    }

    if (solarStageGroup.visible) {
      for (const nodeObj of deviceNodes3D.values()) {
        if (!nodeObj.anchorGroup.visible) continue;
        if (nodeObj.isSunCenter) {
          nodeObj.deviceRootGroup.rotation.y = elapsed * 0.2;
        } else {
          if (autoOrbitEnabled && nodeObj.orbitSpeed > 0.0001) {
            nodeObj.angle += nodeObj.orbitSpeed * 0.007;
          }
          const x = Math.cos(nodeObj.angle) * nodeObj.tierRadius;
          const z = Math.sin(nodeObj.angle) * nodeObj.tierRadius;
          nodeObj.anchorGroup.position.set(x, Math.sin(elapsed * 1.5 + nodeObj.angle) * 0.1, z);
          nodeObj.deviceRootGroup.rotation.y = elapsed * 0.3 + nodeObj.angle * 0.5;
        }
      }
    }

    const scLeft = Math.max(0, stageRect.left);
    const scRight = Math.min(window.innerWidth, stageRect.right);
    const scTop = Math.max(0, stageRect.top);
    const scBottom = Math.min(window.innerHeight, stageRect.bottom);
    const scWidth = Math.max(0, scRight - scLeft);
    const scHeight = Math.max(0, scBottom - scTop);

    if (scWidth > 0 && scHeight > 0) {
      camera.aspect = stageRect.width / Math.max(1, stageRect.height);
      camera.updateProjectionMatrix();

      renderer.autoClear = false;
      renderer.setViewport(
        stageRect.left,
        window.innerHeight - stageRect.bottom,
        stageRect.width,
        stageRect.height
      );
      renderer.setScissor(scLeft, window.innerHeight - scBottom, scWidth, scHeight);
      renderer.setScissorTest(true);
      renderer.clearDepth();
      renderer.render(stageScene, camera);
      renderer.setScissorTest(false);
      renderer.autoClear = true;
    }
  }
}

function handleResize() {
  const viewportWidth = Math.max(1, window.innerWidth);
  const viewportHeight = Math.max(1, window.innerHeight);

  bgCamera.aspect = viewportWidth / viewportHeight;
  bgCamera.updateProjectionMatrix();

  const activeStageContainer =
    currentPage === 'inicio'
      ? heroViewportEl
      : currentPage === 'laboratorio'
      ? labViewportEl
      : interactiveMountEl;

  if (activeStageContainer) {
    const rect = activeStageContainer.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
  }

  // Ajustar distancia Z de la cámara si window.innerWidth < 768 para que placa-madre.glb nunca se corte en vertical
  if (currentPage === 'inicio' || (currentPage === 'laboratorio' && labViewMode === 'INSPECTOR')) {
    const baseZ = currentPage === 'inicio' ? 6.4 : 6.8;
    const targetZ = getResponsiveCameraZ(baseZ);
    if (window.innerWidth < 768 && camera.position.z < targetZ) {
      camera.position.z = targetZ;
    }
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(viewportWidth, viewportHeight);
}

// Debounce (150ms) aplicado al evento window.resize y ResizeObserver sobre el contenedor del canvas 3D
let resizeDebounceTimer = null;
function debouncedHandleResize() {
  if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(() => {
    handleResize();
  }, 150);
}

window.addEventListener('resize', debouncedHandleResize);
window.addEventListener('orientationchange', debouncedHandleResize);
if (typeof ResizeObserver !== 'undefined') {
  const ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect || {};
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }
    debouncedHandleResize();
  });
  if (container) ro.observe(container);
  if (interactiveMountEl) ro.observe(interactiveMountEl);
  if (heroViewportEl) ro.observe(heroViewportEl);
  if (labViewportEl) ro.observe(labViewportEl);
}

// ============================================================================
// 9. NAVEGACIÓN ENTRE LAS 6 PÁGINAS, DROPDOWNS, TABS, CARRUSEL Y MODALES
// ============================================================================
const VALID_PAGES = ['inicio', 'servicios', 'laboratorio', 'blog', 'nosotros', 'contacto'];

function mount3DViewportForCurrentPage() {
  if (!interactiveMountEl) return;

  if (currentPage === 'inicio' && heroViewportEl) {
    heroViewportEl.appendChild(interactiveMountEl);
    // Permitir scroll fluido con el pulgar en teléfonos y tablets sobre el Hero (touch-action: pan-y)
    interactiveMountEl.style.touchAction = 'pan-y';
    heroViewportEl.style.touchAction = 'pan-y';
    if (renderer.domElement) renderer.domElement.style.touchAction = 'pan-y';
    controls.enableZoom = false;
    controls.enablePan = false;
    inspectorStageGroup.visible = true;
    solarStageGroup.visible = false;
    camera.position.set(0, 2.7, getResponsiveCameraZ(6.4));
    controls.target.set(0, 0, 0);
    renderInspectorStageModel(heroPreviewAsset, false);
    handleResize();
  } else if (currentPage === 'laboratorio' && labViewportEl) {
    labViewportEl.appendChild(interactiveMountEl);
    // Controles táctiles completos en el visor del Laboratorio 3D
    interactiveMountEl.style.touchAction = 'none';
    labViewportEl.style.touchAction = 'none';
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    setLabViewMode(labViewMode);
    handleResize();
  }
}

function setLabViewMode(mode) {
  labViewMode = mode === 'SOLAR' ? 'SOLAR' : 'INSPECTOR';
  const btnInsp = document.getElementById('btn-mode-inspector');
  const btnSolar = document.getElementById('btn-mode-solar');

  if (btnInsp && btnSolar) {
    btnInsp.className =
      labViewMode === 'INSPECTOR'
        ? 'studio-btn-active px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer'
        : 'studio-btn px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer';
    btnSolar.className =
      labViewMode === 'SOLAR'
        ? 'studio-btn-active px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer'
        : 'studio-btn px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer';
  }

  if (labViewMode === 'SOLAR') {
    inspectorStageGroup.visible = false;
    solarStageGroup.visible = true;
    const solarZ = window.innerWidth < 768 ? 26.5 : 22.5;
    gsap.to(camera.position, { x: 0, y: 13.5, z: solarZ, duration: 0.7, ease: 'power2.out' });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.7, ease: 'power2.out' });
    const pillEl = document.getElementById('lab-active-asset-pill');
    if (pillEl) pillEl.textContent = 'Sistema Solar 3D (11 modelos .glb activos)';
  } else {
    inspectorStageGroup.visible = true;
    solarStageGroup.visible = false;
    const activeNode = deviceNodes3D.get(activeDeviceId);
    renderInspectorStageModel(activeNode?.assetFile || 'placa-madre.glb', usbAssemblyMode);
    gsap.to(camera.position, {
      x: 0,
      y: 2.9,
      z: getResponsiveCameraZ(6.8),
      duration: 0.65,
      ease: 'power2.out'
    });
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.65, ease: 'power2.out' });
  }
}

function navigateToPage(pageName, options = {}) {
  const target = VALID_PAGES.includes(pageName) ? pageName : 'inicio';
  currentPage = target;

  document.querySelectorAll('[data-page-section]').forEach(sec => {
    const isMatch = sec.getAttribute('data-page-section') === target;
    sec.classList.toggle('hidden', !isMatch);
  });

  document.querySelectorAll('[data-nav-page]').forEach(link => {
    if (link.classList.contains('nav-link-pill')) {
      link.classList.toggle('is-active', link.getAttribute('data-nav-page') === target);
    }
  });

  // Cerrar menú móvil y dropdowns abiertos
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
    toggleMobileMenu(false);
  }
  document.querySelectorAll('[data-dropdown]').forEach(d => d.classList.remove('is-open'));

  if (window.location.hash !== `#${target}` && !options.skipHash) {
    history.replaceState(null, '', `#${target}`);
  }

  mount3DViewportForCurrentPage();

  if (!options.keepScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Eventos de navegación en Header, Footer, Breadcrumbs y Botones
document.querySelectorAll('[data-nav-page]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateToPage(el.getAttribute('data-nav-page'));
  });
});

window.addEventListener('hashchange', () => {
  const raw = window.location.hash.replace('#', '').trim().toLowerCase();
  if (VALID_PAGES.includes(raw) && raw !== currentPage) {
    navigateToPage(raw, { skipHash: true });
  }
});

// Menú Hamburguesa Móvil
function toggleMobileMenu(forceState) {
  const drawer = document.getElementById('mobile-nav-drawer');
  const btn = document.getElementById('btn-mobile-menu');
  const iconOpen = document.getElementById('icon-menu-open');
  const iconClose = document.getElementById('icon-menu-close');
  if (!drawer) return;

  const willOpen = typeof forceState === 'boolean' ? forceState : drawer.classList.contains('hidden');
  drawer.classList.toggle('hidden', !willOpen);
  btn?.setAttribute('aria-expanded', String(willOpen));
  iconOpen?.classList.toggle('hidden', willOpen);
  iconClose?.classList.toggle('hidden', !willOpen);
}

document.getElementById('btn-mobile-menu')?.addEventListener('click', () => toggleMobileMenu());

// Menús Dropdown (Servicios ▾ y Blog ▾)
document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const wrapper = btn.closest('[data-dropdown]');
    const wasOpen = wrapper?.classList.contains('is-open');
    document.querySelectorAll('[data-dropdown]').forEach(d => d.classList.remove('is-open'));
    if (wrapper && !wasOpen) wrapper.classList.add('is-open');
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('[data-dropdown]')) {
    document.querySelectorAll('[data-dropdown]').forEach(d => d.classList.remove('is-open'));
  }
});

// Enlaces del Dropdown de Servicios -> Filtran pestaña automáticamente
function activateServiceTab(category) {
  document.querySelectorAll('[data-service-tab]').forEach(b => {
    b.classList.toggle('is-active', b.getAttribute('data-service-tab') === category);
  });
  document.querySelectorAll('[data-service-category]').forEach(card => {
    const match = category === 'ALL' || card.getAttribute('data-service-category') === category;
    card.classList.toggle('hidden', !match);
  });
}

document.querySelectorAll('[data-service-tab]').forEach(btn => {
  btn.addEventListener('click', () => activateServiceTab(btn.getAttribute('data-service-tab')));
});

document.querySelectorAll('[data-service-jump]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const cat = link.getAttribute('data-service-jump') || 'ALL';
    navigateToPage('servicios');
    activateServiceTab(cat);
  });
});

// Enlaces y Pestañas del Blog
function activateBlogTab(category) {
  document.querySelectorAll('[data-blog-tab]').forEach(b => {
    b.classList.toggle('is-active', b.getAttribute('data-blog-tab') === category);
  });
  document.querySelectorAll('[data-blog-category]').forEach(card => {
    const match = category === 'ALL' || card.getAttribute('data-blog-category') === category;
    card.classList.toggle('hidden', !match);
  });
}

document.querySelectorAll('[data-blog-tab]').forEach(btn => {
  btn.addEventListener('click', () => activateBlogTab(btn.getAttribute('data-blog-tab')));
});

document.querySelectorAll('[data-blog-case]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const caseId = link.getAttribute('data-blog-case');
    navigateToPage('blog', { keepScroll: true });
    activateBlogTab('ALL');
    setTimeout(() => {
      document.getElementById(caseId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  });
});

// Botones directos "VIEW 3D MODEL / DEMO ->" e "Inspeccionar 3D" desde cualquier página
function inspectGlbInLaboratory(assetFile) {
  activeCategoryFilter = 'ALL';
  document.querySelectorAll('.nav-filter-btn').forEach(b => {
    b.classList.toggle('is-active', b.getAttribute('data-filter') === 'ALL');
  });
  labViewMode = 'INSPECTOR';
  navigateToPage('laboratorio');
  selectDeviceByGlbAsset(assetFile);
  showToast(`Inspeccionando modelo real assets/${assetFile}`, 'sky');
}

document.addEventListener('click', e => {
  const inspectBtn = e.target.closest('[data-inspect-glb]');
  if (inspectBtn) {
    e.preventDefault();
    closeAllModals();
    inspectGlbInLaboratory(inspectBtn.getAttribute('data-inspect-glb'));
  }
});

// Selector rápido de modelo en el Hero de Inicio (Monolith Carbon)
document.querySelectorAll('[data-hero-model]').forEach(btn => {
  btn.addEventListener('click', () => {
    heroPreviewAsset = btn.getAttribute('data-hero-model') || 'placa-madre.glb';
    document.querySelectorAll('[data-hero-model]').forEach(b => {
      const active = b.getAttribute('data-hero-model') === heroPreviewAsset;
      b.className = active
        ? 'hero-glb-pill px-2.5 py-1 rounded-full text-[10px] num-mono bg-[#ffffff] text-[#050505] font-bold border border-[#ffffff] cursor-pointer'
        : 'hero-glb-pill px-2.5 py-1 rounded-full text-[10px] num-mono bg-[#0b0b0d] text-zinc-200 border border-[#27272a] hover:border-white cursor-pointer';
    });
    renderInspectorStageModel(heroPreviewAsset, false);
  });
});

// Carrusel Dinámico de Perfiles de Hardware en Inicio
const CAROUSEL_SLIDES = [
  {
    badge: 'PERFIL 01 · ARQUITECTURA ATX & CPU',
    title: 'Placa Madre ATX & Procesador Multi-Core (8C/16T)',
    assets: 'assets/placa-madre.glb · assets/procesador.glb',
    desc: 'Monitoreo térmico por núcleo en tiempo real, líneas PCIe Gen4 y suministro VRM renderizados con exposición atenuada 0.82.',
    glb: 'placa-madre.glb',
    metrics: ['Exposición: 0.82 ACES', 'CPU: 4120 MHz · 45.2°C', 'GPU PCIe x16: Nominal']
  },
  {
    badge: 'PERFIL 02 · MEMORIA FÍSICA REAL',
    title: '32GB DDR4 3200MHz Dual-Channel (2 × 16GB)',
    assets: 'assets/ram.glb',
    desc: 'Configuración simétrica Dual-Channel verificada a 3200 MT/s con auditoría EDAC sin errores de paridad.',
    glb: 'ram.glb',
    metrics: ['Capacidad: 32 GB (2x16GB)', 'Reloj: 3200 MHz @ 1.35V', 'Estado EDAC: 0 Errores']
  },
  {
    badge: 'PERFIL 03 · ALMACENAMIENTO S.M.A.R.T.',
    title: 'Unidades NVMe Samsung 970 EVO, Corsair MP600 & SATA',
    assets: 'assets/ssd970evo.glb · assets/ssd-corsair.glb · assets/hdd.glb',
    desc: 'Verificación forense S.M.A.R.T. al 100%, lectura secuencial NVMe hasta 4920 MB/s y exportación JSON en un clic.',
    glb: 'ssd970evo.glb',
    metrics: ['Salud NAND: PASSED 100%', 'CRC / Reasignados: 0', 'Temp Operativa: 37 °C']
  },
  {
    badge: 'PERFIL 04 · ENSAMBLAJE DE BUSES USB',
    title: 'Topología Eléctrica VBUS 5.00V & Despiece USB',
    assets: 'assets/usbport.glb · usbflash.glb · usbbodyplug.glb · .5.glb',
    desc: 'Supervisión de tensión VBUS frente a caídas menores a 4.75V e inspección completa de los 4 módulos del bus USB.',
    glb: 'usbport.glb',
    metrics: ['VBUS Nominal: 5.02 V', 'Umbral Crítico: < 4.75 V', 'Módulos 3D: 4 Activos']
  },
  {
    badge: 'PERFIL 05 · GAMEPAD HID & STICK DRIFT',
    title: 'Gamepad Inalámbrico Krom KLOUD (NXKROMKLD)',
    assets: 'assets/xbox_360_joystick_3d_scan.glb · assets/krom_kloud.png',
    desc: 'Lectura directa de navigator.getGamepads(), cálculo de jitter en milisegundos y alerta automática de deriva > 0.08.',
    glb: 'xbox_360_joystick_3d_scan.glb',
    metrics: ['Referencia: NXKROMKLD', 'Deadzone Nominal: ≤ 0.08', 'Polling HID: 250 Hz']
  }
];

let currentCarouselIdx = 0;

function renderHardwareCarousel() {
  const stageEl = document.getElementById('hardware-carousel-stage');
  const dotsEl = document.getElementById('hardware-carousel-dots');
  const counterEl = document.getElementById('carousel-counter');
  if (!stageEl) return;

  const slide = CAROUSEL_SLIDES[currentCarouselIdx];
  if (counterEl) counterEl.textContent = `0${currentCarouselIdx + 1} / 0${CAROUSEL_SLIDES.length}`;

  stageEl.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center page-enter">
      <div class="lg:col-span-8 space-y-3 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-[#0b0b0d] border border-[#27272a] text-white text-[10px] font-bold num-mono">
            ${escapeHtml(slide.badge)}
          </span>
          <span class="num-mono text-xs text-zinc-400 break-words">${escapeHtml(slide.assets)}</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-white break-words">${escapeHtml(slide.title)}</h3>
        <p class="text-sm text-zinc-300 leading-relaxed break-words">${escapeHtml(slide.desc)}</p>
        <div class="flex flex-wrap gap-2 pt-1">
          ${slide.metrics
            .map(
              m =>
                `<span class="px-3 py-1 rounded-xl bg-[#0b0b0d] border border-[#27272a] num-mono text-xs text-zinc-200">${escapeHtml(m)}</span>`
            )
            .join('')}
        </div>
      </div>
      <div class="lg:col-span-4 flex lg:justify-end">
        <button type="button" data-inspect-glb="${escapeHtml(slide.glb)}" class="btn-pill-primary px-6 py-3 text-xs sm:text-sm w-full sm:w-auto rounded-full bg-[#ffffff] hover:bg-[#e4e4e7] text-[#050505]">
          <span>VIEW 3D MODEL / DEMO</span>
          <span class="pill-arrow">→</span>
        </button>
      </div>
    </div>
  `;

  if (dotsEl) {
    dotsEl.innerHTML = CAROUSEL_SLIDES.map(
      (_, i) =>
        `<button type="button" data-carousel-dot="${i}" aria-label="Ir al perfil ${i + 1}" class="h-2 rounded-full transition-all cursor-pointer ${
          i === currentCarouselIdx ? 'w-7 bg-white' : 'w-2 bg-[#27272a] hover:bg-zinc-500'
        }"></button>`
    ).join('');

    dotsEl.querySelectorAll('[data-carousel-dot]').forEach(dot => {
      dot.addEventListener('click', () => {
        currentCarouselIdx = Number(dot.getAttribute('data-carousel-dot'));
        renderHardwareCarousel();
      });
    });
  }
}

document.getElementById('btn-carousel-prev')?.addEventListener('click', () => {
  currentCarouselIdx = (currentCarouselIdx - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
  renderHardwareCarousel();
});

document.getElementById('btn-carousel-next')?.addEventListener('click', () => {
  currentCarouselIdx = (currentCarouselIdx + 1) % CAROUSEL_SLIDES.length;
  renderHardwareCarousel();
});

// ============================================================================
// 10. MODALES DE DIAGNÓSTICO, FLUJO DUAL DE CORREO Y ANTI-SPAM (COOLDOWN 15S)
// ============================================================================
const CASE_REPORTS = {
  1: {
    badge: 'INFORME TÉCNICO #01 · ARQUITECTURA BASE & CPU',
    title: '1. Arquitectura Base ATX, Estabilidad VRM y Telemetría Multi-Core',
    glb: 'placa-madre.glb',
    html: `
      <p>Este módulo vincula directamente <code class="num-mono text-white">assets/placa-madre.glb</code> y <code class="num-mono text-white">assets/procesador.glb</code> con el recolector de telemetría en tiempo real.</p>
      <div class="p-3.5 rounded-2xl bg-[#050505] border border-[#27272a] space-y-1.5 text-xs">
        <div><strong class="text-white">• Calibración Óptica WebGL:</strong> Exposición <code class="num-mono text-white">0.82</code> con <code class="num-mono">ACESFilmicToneMapping</code> y anisotropía máxima para inspeccionar pistas de cobre y serigrafías sin deslumbramiento.</div>
        <div><strong class="text-white">• Supervisión Eléctrica:</strong> Monitoreo simultáneo de errores PCIe AER, estados ACPI y temperatura individual de los 8 núcleos físicos / 16 hilos.</div>
      </div>
    `
  },
  2: {
    badge: 'INFORME TÉCNICO #02 · MEMORIA DUAL-CHANNEL',
    title: '2. Rendimiento y Simetría en Memoria 32GB DDR4 3200MHz Dual-Channel',
    glb: 'ram.glb',
    html: `
      <p>Estudio basado en la configuración real de estación de trabajo de <strong class="text-white">Kevin Alexis Bahamonde Cárdenas</strong>: <strong class="text-white">32GB DDR4 3200MHz Dual-Channel (2×16GB)</strong> representada por <code class="num-mono text-white">assets/ram.glb</code>.</p>
      <div class="p-3.5 rounded-2xl bg-[#050505] border border-[#27272a] space-y-1.5 text-xs">
        <div><strong class="text-white">• Entrelazado de Canales:</strong> La ocupación simétrica de bancos A2 y B2 duplica el ancho de banda teórico a 51.2 GB/s, clave para mantener 60 FPS al decodificar geometrías GLB densas.</div>
        <div><strong class="text-white">• Verificación EDAC:</strong> Conteo continuo de errores corregibles/no corregibles en controladores de memoria del kernel.</div>
      </div>
    `
  },
  3: {
    badge: 'INFORME TÉCNICO #03 · AUDITORÍA S.M.A.R.T.',
    title: '3. Diagnóstico Forense S.M.A.R.T. en Unidades NVMe M.2 y SATA',
    glb: 'ssd970evo.glb',
    html: `
      <p>Inspección comparativa de <code class="num-mono text-white">assets/ssd970evo.glb</code>, <code class="num-mono text-white">assets/ssd-corsair.glb</code> y <code class="num-mono text-white">assets/hdd.glb</code> integrando atributos reales de salud de almacenamiento.</p>
      <div class="p-3.5 rounded-2xl bg-[#050505] border border-[#27272a] space-y-1.5 text-xs">
        <div><strong class="text-white">• Métricas Auditadas:</strong> Salud global (<code class="num-mono text-emerald-300">PASSED</code>), desgaste NAND porcentual, horas de operación acumuladas, apagados inseguros y errores CRC de bus.</div>
        <div><strong class="text-white">• Exportación JSON:</strong> Permite respaldar la instantánea forense firmada con los metadatos del autor para auditoría externa.</div>
      </div>
    `
  },
  4: {
    badge: 'INFORME TÉCNICO #04 · VBUS USB & KROM KLOUD',
    title: '4. Ensamblaje de Buses USB y Detección de Stick Drift en Krom KLOUD',
    glb: 'xbox_360_joystick_3d_scan.glb',
    html: `
      <p>Combina el despiece USB (<code class="num-mono text-white">usbport.glb</code>, <code class="num-mono text-white">usbflash.glb</code>, <code class="num-mono text-white">usbbodyplug.glb</code> y <code class="num-mono text-white">.5.glb</code>) con el laboratorio de mando inalámbrico <strong class="text-white">Krom KLOUD (NXKROMKLD)</strong>.</p>
      <div class="p-3.5 rounded-2xl bg-[#050505] border border-[#27272a] space-y-1.5 text-xs">
        <div><strong class="text-white">• Protección Eléctrica VBUS:</strong> Detecta caídas por debajo de <code class="num-mono text-rose-300">4.75V</code> que provocan desconexiones intermitentes en receptores inalámbricos 2.4GHz.</div>
        <div><strong class="text-white">• Algoritmo Anti-Drift (&gt; 0.08):</strong> Analiza vectores analógicos en reposo sobre <code class="num-mono text-white">assets/krom_kloud.png</code> y <code class="num-mono text-white">xbox_360_joystick_3d_scan.glb</code>.</div>
      </div>
    `
  }
};

function buildSmartExportPayload() {
  return {
    reportId: `HAL-NEXUS-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    metadata: AUTHOR_METADATA,
    renderEngine: {
      toneMapping: 'ACESFilmicToneMapping',
      exposure: 0.82,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
      pixelRatio: renderer.getPixelRatio()
    },
    environmentHardware: {
      ram: '32GB DDR4 3200MHz Dual-Channel (2x16GB)',
      gamepad: 'Krom KLOUD Wireless (NXKROMKLD)',
      minUsbVbusV: currentTelemetry?.summary?.minUsbVbus ?? 5.0,
      gamepadDriftDetected: gamepadState.driftDetected
    },
    devices: (currentTelemetry?.devices || []).map(d => ({
      id: d.deviceId,
      name: d.nombre,
      type: d.tipo,
      asset3D: `assets/${d.glbAsset}`,
      status: d.estado,
      smart: d.smart || undefined,
      vbusV: d.voltaje_vbus || undefined
    }))
  };
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modalId === 'modal-smart-json') {
    const pre = document.getElementById('smart-json-output');
    if (pre) pre.textContent = JSON.stringify(buildSmartExportPayload(), null, 2);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function closeAllModals() {
  ['modal-smart-json', 'modal-case-reader'].forEach(closeModal);
}

document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-modal')));
});

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close-modal')));
});

['modal-smart-json', 'modal-case-reader'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('click', e => {
    if (e.target === el) closeModal(id);
  });
});

// Abrir Modal Lector de Casos desde las tarjetas numeradas 1., 2., 3., 4.
document.querySelectorAll('[data-read-case]').forEach(btn => {
  btn.addEventListener('click', () => {
    const num = btn.getAttribute('data-read-case');
    const data = CASE_REPORTS[num] || CASE_REPORTS[1];
    const badgeEl = document.getElementById('modal-case-badge');
    const titleEl = document.getElementById('modal-case-title');
    const bodyEl = document.getElementById('modal-case-body');
    const inspectBtn = document.getElementById('modal-case-inspect-btn');

    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl) bodyEl.innerHTML = data.html;
    if (inspectBtn) inspectBtn.setAttribute('data-inspect-glb', data.glb);

    openModal('modal-case-reader');
  });
});

// Copiar y Descargar JSON S.M.A.R.T.
function copyTextToClipboard(text, confirmMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(confirmMessage, 'emerald'))
      .catch(() => fallbackCopyText(text, confirmMessage));
  } else {
    fallbackCopyText(text, confirmMessage);
  }
}

function fallbackCopyText(text, confirmMessage) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(confirmMessage, 'emerald');
  } catch {
    showToast(`Correo: ${text}`, 'sky');
  }
  ta.remove();
}

document.getElementById('btn-copy-json')?.addEventListener('click', () => {
  const jsonStr = JSON.stringify(buildSmartExportPayload(), null, 2);
  copyTextToClipboard(jsonStr, 'Reporte JSON S.M.A.R.T. copiado al portapapeles');
});

document.getElementById('btn-download-json')?.addEventListener('click', () => {
  const jsonStr = JSON.stringify(buildSmartExportPayload(), null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hal-nexus-smart-telemetry.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo hal-nexus-smart-telemetry.json descargado', 'emerald');
});

// Copiado en 1 clic de alexis.bahamonde172@gmail.com con Toast visual
document.querySelectorAll('[data-copy-email]').forEach(btn => {
  btn.addEventListener('click', () => {
    const email = sanitizeInput(btn.getAttribute('data-copy-email') || AUTHOR_METADATA.email);
    copyTextToClipboard(email, `✓ Correo ${email} copiado al portapapeles`);
  });
});

// Preselección de módulo desde tarjetas de Servicios hacia Contacto
document.querySelectorAll('[data-ticket-preset]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const preset = sanitizeInput(link.getAttribute('data-ticket-preset') || '');
    navigateToPage('contacto');
    const selectEl = document.getElementById('ticket-module');
    if (selectEl) {
      for (const opt of selectEl.options) {
        if (opt.value.includes(preset.split('(')[0].trim())) {
          selectEl.value = opt.value;
          break;
        }
      }
    }
  });
});

// ----------------------------------------------------------------------------
// SISTEMA ANTI-SPAM Y COOLDOWN DE 15 SEGUNDOS (FORMULARIO Y BOTONES ESCANEO)
// ----------------------------------------------------------------------------
const CLIENT_COOLDOWN_MS = 15000;
const actionCooldownTimestamps = new Map();

function checkAndStartCooldown(actionKey, buttons = [], statusEl = null, customDurationMs = CLIENT_COOLDOWN_MS) {
  const now = Date.now();
  const unlockAt = actionCooldownTimestamps.get(actionKey) || 0;
  if (now < unlockAt) {
    const remainingSec = Math.ceil((unlockAt - now) / 1000);
    showToast(`Anti-saturación activa: espera ${remainingSec}s antes de repetir esta acción.`, 'pink');
    return false;
  }

  const nextUnlock = now + customDurationMs;
  actionCooldownTimestamps.set(actionKey, nextUnlock);

  const validButtons = buttons.filter(Boolean);
  validButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('opacity-50', 'pointer-events-none');
  });

  const intervalId = setInterval(() => {
    const remMs = nextUnlock - Date.now();
    if (remMs <= 0) {
      clearInterval(intervalId);
      validButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'pointer-events-none');
      });
      if (statusEl) {
        statusEl.textContent = `Destino: ${AUTHOR_METADATA.email}`;
      }
    } else if (statusEl) {
      const sec = Math.ceil(remMs / 1000);
      statusEl.textContent = `Bloqueo anti-spam activo: disponible en ${sec}s`;
    }
  }, 500);

  return true;
}

// Validación, sanitización XSS, Honeypot anti-bots y redirección dual (App mailto: + Gmail Web)
const ticketForm = document.getElementById('technical-ticket-form');
const btnSubmitMailto = document.getElementById('btn-submit-mailto');
const btnSubmitGmail = document.getElementById('btn-submit-gmail');
const ticketCooldownStatusEl = document.getElementById('ticket-cooldown-status');

function processAndDispatchTicket(channel = 'mailto') {
  const honeypotIn = document.getElementById('ticket-honeypot');
  // Si el campo oculto honeypot fue rellenado por un bot, cancelar envío silenciosamente
  if (honeypotIn && honeypotIn.value.trim() !== '') {
    showToast('Solicitud bloqueada por filtro anti-bots.', 'pink');
    return;
  }

  const nameIn = document.getElementById('ticket-name');
  const emailIn = document.getElementById('ticket-email');
  const modIn = document.getElementById('ticket-module');
  const msgIn = document.getElementById('ticket-message');

  // Sanitización XSS antes de procesar cualquier dato del formulario
  const nameVal = sanitizeInput(nameIn?.value || '');
  const emailVal = sanitizeInput(emailIn?.value || '');
  const modVal = sanitizeInput(modIn?.value || '');
  const msgVal = sanitizeInput(msgIn?.value || '');

  // Reflejar el valor limpio usando value / textContent seguro
  if (nameIn) nameIn.value = nameVal;
  if (emailIn) emailIn.value = emailVal;
  if (msgIn) msgIn.value = msgVal;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validName = nameVal.length >= 2;
  const validEmail = emailRegex.test(emailVal);
  const validMod = modVal.length > 0;
  const validMsg = msgVal.length >= 10;

  document.getElementById('err-ticket-name')?.classList.toggle('hidden', validName);
  document.getElementById('err-ticket-email')?.classList.toggle('hidden', validEmail);
  document.getElementById('err-ticket-module')?.classList.toggle('hidden', validMod);
  document.getElementById('err-ticket-message')?.classList.toggle('hidden', validMsg);

  if (!validName || !validEmail || !validMod || !validMsg) {
    showToast('Por favor completa correctamente todos los campos del ticket.', 'pink');
    return;
  }

  // Aplicar bloqueo (cooldown) de 15 segundos entre envíos
  if (
    !checkAndStartCooldown(
      'ticket_form_submit',
      [btnSubmitMailto, btnSubmitGmail],
      ticketCooldownStatusEl,
      CLIENT_COOLDOWN_MS
    )
  ) {
    return;
  }

  const ticketCode = `HAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const subject = `[HAL-Nexus] Ticket ${ticketCode} - ${modVal}`;
  const bodyLines = [
    `Ticket Técnico HAL-Nexus (${ticketCode})`,
    `Plataforma de Telemetría y Diagnóstico de Hardware 3D`,
    `Destinatario Oficial: Kevin Alexis Bahamonde Cárdenas (${AUTHOR_METADATA.email})`,
    `--------------------------------------------------`,
    `Remitente: ${nameVal}`,
    `Correo de Respuesta: ${emailVal}`,
    `Módulo de Hardware: ${modVal}`,
    `Fecha: ${new Date().toLocaleString('es-CL')}`,
    `--------------------------------------------------`,
    `Detalle / Observaciones:`,
    msgVal,
    ``,
    `-- Generado desde HAL-Nexus | Plataforma de Telemetría y Diagnóstico de Hardware 3D`
  ].join('\n');

  const mailtoHref = `mailto:${AUTHOR_METADATA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
  const gmailWebHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(AUTHOR_METADATA.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;

  const resBox = document.getElementById('ticket-dispatch-result');
  const resSum = document.getElementById('ticket-dispatch-summary');
  const fallbackMailtoLink = document.getElementById('ticket-fallback-mailto');
  const fallbackGmailLink = document.getElementById('ticket-fallback-gmail');

  if (resBox) resBox.classList.remove('hidden');
  // Uso estricto de textContent en lugar de innerHTML para datos del usuario
  if (resSum) {
    resSum.textContent = `Código ${ticketCode} • Módulo: ${modVal} • Remitente: ${nameVal} (${emailVal})`;
  }
  if (fallbackMailtoLink) fallbackMailtoLink.href = mailtoHref;
  if (fallbackGmailLink) fallbackGmailLink.href = gmailWebHref;

  if (channel === 'gmail') {
    showToast(`Abriendo Gmail Web hacia ${AUTHOR_METADATA.email}`, 'emerald');
    window.open(gmailWebHref, '_blank', 'noopener,noreferrer');
  } else {
    showToast(`Abriendo App de Correo (mailto:) hacia ${AUTHOR_METADATA.email}`, 'emerald');
    window.location.href = mailtoHref;
  }
}

ticketForm?.addEventListener('submit', e => {
  e.preventDefault();
  processAndDispatchTicket('mailto');
});

btnSubmitGmail?.addEventListener('click', () => {
  processAndDispatchTicket('gmail');
});

// ============================================================================
// 11. CONTROLES DEL LABORATORIO 3D, HOTSPOTS, PANTALLA Y WEBSOCKET BLINDADO
// ============================================================================
function highlightDisplayDiagnosticsCard() {
  const cardEl = document.getElementById('lab-display-diagnostics-card');
  if (!cardEl) return;
  cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cardEl.classList.add('ring-2', 'ring-sky-400');
  setTimeout(() => {
    cardEl.classList.remove('ring-2', 'ring-sky-400');
  }, 2200);
}

document.querySelectorAll('.nav-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const rawFilter = sanitizeInput(btn.getAttribute('data-filter') || 'ALL');
    activeCategoryFilter = rawFilter || 'ALL';
    document.querySelectorAll('.nav-filter-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-filter') === activeCategoryFilter);
    });

    if (activeCategoryFilter === 'DISPLAY') {
      updateDisplayDiagnosticsDOM();
      highlightDisplayDiagnosticsCard();
      showToast('Diagnóstico de Pantalla & Panel (Hz Reales y Test de Píxeles)', 'sky');
      return;
    }

    applyCategoryFilterToScene();
    renderNavigationDeviceList();

    // Seleccionar automáticamente el primer modelo de la categoría filtrada
    const firstMatch = Array.from(deviceNodes3D.values()).find(
      n => activeCategoryFilter === 'ALL' || n.category === activeCategoryFilter
    );
    if (firstMatch) selectHardwareDevice(firstMatch.deviceId, true);
  });
});

document.querySelectorAll('[data-jump-lab-display]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    activeCategoryFilter = 'DISPLAY';
    document.querySelectorAll('.nav-filter-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-filter') === 'DISPLAY');
    });
    navigateToPage('laboratorio');
    updateDisplayDiagnosticsDOM();
    setTimeout(() => highlightDisplayDiagnosticsCard(), 120);
  });
});

// Botones de Hotspots 3D de Placa Madre y Procesador en la barra superior del visor
document.querySelectorAll('#mobo-hotspots-bar [data-mobo-hotspot]').forEach(btn => {
  btn.addEventListener('click', () => {
    focusMotherboardHotspot(btn.getAttribute('data-mobo-hotspot') || 'general');
  });
});

// Switch opcional "Simular telemetría de prueba" para modelos 3D de almacenamiento no montados
document.getElementById('toggle-sim-storage-telemetry')?.addEventListener('change', e => {
  simulateReferenceStorageTelemetry = Boolean(e.target.checked);
  updateInspectorCardUI(activeDeviceId);
  renderNavigationDeviceList();
  showToast(
    simulateReferenceStorageTelemetry
      ? 'Simulación de telemetría de prueba activada para modelos 3D no montados'
      : 'Modo estricto real: modelos 3D no montados muestran 0 h (No montado)',
    simulateReferenceStorageTelemetry ? 'emerald' : 'sky'
  );
});

// ----------------------------------------------------------------------------
// LIENZO FULLSCREEN: TEST DE PÍXELES MUERTOS, SUBPÍXELES Y FUGA DE LUZ (BLEED)
// ----------------------------------------------------------------------------
const PIXEL_TEST_PATTERNS = [
  { index: 0, hex: '#000000', label: '1/6 • Negro Puro (#000000) — Fuga de Luz / Backlight Bleed', type: 'solid' },
  { index: 1, hex: '#FFFFFF', label: '2/6 • Blanco Puro (#FFFFFF) — Píxeles Muertos / Uniformidad', type: 'solid' },
  { index: 2, hex: '#FF0000', label: '3/6 • Rojo Puro (#FF0000) — Subpíxeles Rojos', type: 'solid' },
  { index: 3, hex: '#00FF00', label: '4/6 • Verde Puro (#00FF00) — Subpíxeles Verdes', type: 'solid' },
  { index: 4, hex: '#0000FF', label: '5/6 • Azul Puro (#0000FF) — Subpíxeles Azules', type: 'solid' },
  { index: 5, hex: '#050505', label: '6/6 • Rejilla de Calibración Óptica — Geometría & Nitidez', type: 'grid' }
];

let pixelTestActive = false;
let currentPixelPatternIdx = 0;

function renderPixelTestCanvas() {
  const canvasEl = document.getElementById('pixel-test-canvas');
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  if (canvasEl.width !== w || canvasEl.height !== h) {
    canvasEl.width = w;
    canvasEl.height = h;
  }

  const pat = PIXEL_TEST_PATTERNS[currentPixelPatternIdx] || PIXEL_TEST_PATTERNS[0];
  ctx.fillStyle = pat.hex;
  ctx.fillRect(0, 0, w, h);

  if (pat.type === 'grid') {
    const step = 64;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // Ejes centrales y círculos de convergencia óptica
    const cx = Math.round(w / 2) + 0.5;
    const cy = Math.round(h / 2) + 0.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    [90, 200, 340].forEach(radius => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Marco perimetral de overscan 1px
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  }

  const labelEl = document.getElementById('pixel-test-mode-label');
  const swatchEl = document.getElementById('pixel-test-swatch');
  if (labelEl) labelEl.textContent = pat.label;
  if (swatchEl) {
    swatchEl.style.backgroundColor = pat.type === 'grid' ? '#38bdf8' : pat.hex;
  }

  document.querySelectorAll('[data-pixel-pattern]').forEach(btn => {
    const idx = Number(btn.getAttribute('data-pixel-pattern'));
    btn.className =
      idx === currentPixelPatternIdx
        ? 'studio-btn-active px-2.5 py-1 rounded-lg text-[10px] num-mono cursor-pointer font-semibold'
        : 'studio-btn px-2.5 py-1 rounded-lg text-[10px] num-mono cursor-pointer';
  });
}

function setPixelTestPattern(index) {
  const len = PIXEL_TEST_PATTERNS.length;
  currentPixelPatternIdx = ((index % len) + len) % len;
  renderPixelTestCanvas();
}

function openFullscreenPixelTest() {
  const overlayEl = document.getElementById('fullscreen-pixel-test-overlay');
  if (!overlayEl) return;
  pixelTestActive = true;
  currentPixelPatternIdx = 0;
  overlayEl.classList.remove('hidden');
  overlayEl.classList.add('flex');
  renderPixelTestCanvas();

  if (overlayEl.requestFullscreen) {
    overlayEl.requestFullscreen().catch(() => {});
  }
}

function closeFullscreenPixelTest() {
  const overlayEl = document.getElementById('fullscreen-pixel-test-overlay');
  if (!overlayEl) return;
  pixelTestActive = false;
  overlayEl.classList.add('hidden');
  overlayEl.classList.remove('flex');
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

document.querySelectorAll('[data-open-pixel-test]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    openFullscreenPixelTest();
  });
});

document.getElementById('pixel-test-canvas')?.addEventListener('click', () => {
  if (!pixelTestActive) return;
  setPixelTestPattern(currentPixelPatternIdx + 1);
});

document.querySelectorAll('[data-pixel-pattern]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    setPixelTestPattern(Number(btn.getAttribute('data-pixel-pattern') || 0));
  });
});

document.getElementById('btn-exit-pixel-test')?.addEventListener('click', e => {
  e.stopPropagation();
  closeFullscreenPixelTest();
});

document.addEventListener('fullscreenchange', () => {
  if (pixelTestActive) {
    renderPixelTestCanvas();
  }
});

window.addEventListener('keydown', e => {
  if (!pixelTestActive) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeFullscreenPixelTest();
    return;
  }
  if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    setPixelTestPattern(currentPixelPatternIdx + 1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    setPixelTestPattern(currentPixelPatternIdx - 1);
  } else if (/^[1-6]$/.test(e.key)) {
    e.preventDefault();
    setPixelTestPattern(Number(e.key) - 1);
  }
});

window.addEventListener('resize', () => {
  if (pixelTestActive) renderPixelTestCanvas();
  updateDisplayDiagnosticsDOM();
});

document.getElementById('btn-mode-inspector')?.addEventListener('click', () => setLabViewMode('INSPECTOR'));
document.getElementById('btn-mode-solar')?.addEventListener('click', () => setLabViewMode('SOLAR'));

document.getElementById('btn-usb-assembly-view')?.addEventListener('click', () => {
  usbAssemblyMode = true;
  labViewMode = 'INSPECTOR';
  setLabViewMode('INSPECTOR');
  renderInspectorStageModel('usbport.glb', true);
  updateInspectorCardUI('USB-PORT');
  renderNavigationDeviceList();
  showToast('Ensamblaje USB activo: usbport + usbflash + usbbodyplug + .5.glb', 'sky');
});

document.getElementById('btn-cam-reset')?.addEventListener('click', () => {
  const z = labViewMode === 'SOLAR' ? (window.innerWidth < 768 ? 26.5 : 22.5) : getResponsiveCameraZ(6.8);
  const y = labViewMode === 'SOLAR' ? 13.5 : 2.9;
  gsap.to(camera.position, { x: 0, y, z, duration: 0.7, ease: 'power2.out' });
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.7, ease: 'power2.out' });
});

document.getElementById('btn-cam-core')?.addEventListener('click', () => {
  gsap.to(camera.position, { x: 0, y: 1.8, z: getResponsiveCameraZ(4.5), duration: 0.7, ease: 'power2.out' });
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.7, ease: 'power2.out' });
});

document.getElementById('btn-cam-top')?.addEventListener('click', () => {
  const y = labViewMode === 'SOLAR' ? 26 : 8.2;
  gsap.to(camera.position, { x: 0, y, z: 0.8, duration: 0.7, ease: 'power2.out' });
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.7, ease: 'power2.out' });
});

document.getElementById('btn-cam-front')?.addEventListener('click', () => {
  const z = labViewMode === 'SOLAR' ? (window.innerWidth < 768 ? 24 : 20) : getResponsiveCameraZ(6.4);
  gsap.to(camera.position, { x: 0, y: 0.6, z, duration: 0.7, ease: 'power2.out' });
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.7, ease: 'power2.out' });
});

document.getElementById('btn-cam-zoom-in')?.addEventListener('click', () => {
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
  dir.setLength(Math.max(2.8, dir.length() * 0.78));
  const next = new THREE.Vector3().addVectors(controls.target, dir);
  gsap.to(camera.position, { x: next.x, y: next.y, z: next.z, duration: 0.4 });
});

document.getElementById('btn-cam-zoom-out')?.addEventListener('click', () => {
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
  dir.setLength(Math.min(36, dir.length() * 1.25));
  const next = new THREE.Vector3().addVectors(controls.target, dir);
  gsap.to(camera.position, { x: next.x, y: next.y, z: next.z, duration: 0.4 });
});

document.getElementById('btn-cam-orbit')?.addEventListener('click', e => {
  autoOrbitEnabled = !autoOrbitEnabled;
  e.currentTarget.textContent = autoOrbitEnabled ? 'Rotación: ON' : 'Rotación: OFF';
  e.currentTarget.className = autoOrbitEnabled
    ? 'studio-btn-active px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer'
    : 'studio-btn px-2.5 py-1 rounded-xl text-[11px] font-medium cursor-pointer';
});

function toggleGamepadDemoMode() {
  gamepadState.demoModeEnabled = !gamepadState.demoModeEnabled;
  const demoBtn = document.getElementById('btn-demo-gamepad');
  if (gamepadState.demoModeEnabled) {
    gamepadState.simulatedDriftActive = false;
    const driftBtn = document.getElementById('btn-sim-drift');
    if (driftBtn) driftBtn.innerHTML = 'Drift <span class="num-mono">&gt;0.08</span>';
    selectHardwareDevice('HID-GAMEPAD', true);
  }
  if (demoBtn) demoBtn.textContent = gamepadState.demoModeEnabled ? 'Parar Demo' : 'Demo Mando';
  updateInspectorCardUI(activeDeviceId);
}

document.getElementById('btn-demo-gamepad')?.addEventListener('click', toggleGamepadDemoMode);

document.getElementById('btn-sim-drift')?.addEventListener('click', e => {
  gamepadState.simulatedDriftActive = !gamepadState.simulatedDriftActive;
  if (gamepadState.simulatedDriftActive) {
    gamepadState.demoModeEnabled = false;
    const demoBtn = document.getElementById('btn-demo-gamepad');
    if (demoBtn) demoBtn.textContent = 'Demo Mando';
    e.currentTarget.textContent = 'Parar Drift';
    selectHardwareDevice('HID-GAMEPAD', true);
    showToast('Simulando Stick Drift > 0.08 en Krom KLOUD', 'pink');
  } else {
    gamepadState.axisDriftTimers = [0, 0, 0, 0];
    e.currentTarget.innerHTML = 'Drift <span class="num-mono">&gt;0.08</span>';
  }
});

document.getElementById('btn-clear-drift-alert')?.addEventListener('click', () => {
  gamepadState.simulatedDriftActive = false;
  gamepadState.axisDriftTimers = [0, 0, 0, 0];
  gamepadState.driftDetected = false;
  gamepadState.driftingAxes = [];
  const driftBtn = document.getElementById('btn-sim-drift');
  if (driftBtn) driftBtn.innerHTML = 'Drift <span class="num-mono">&gt;0.08</span>';
  document.getElementById('drift-critical-banner')?.classList.add('hidden');
  updateInspectorCardUI(activeDeviceId);
});

const btnSimVbusEl = document.getElementById('btn-sim-vbus');
btnSimVbusEl?.addEventListener('click', () => {
  if (!checkAndStartCooldown('sim_vbus_scan', [btnSimVbusEl], null, CLIENT_COOLDOWN_MS)) return;
  if (socket && socket.connected) {
    socket.emit('simulate_fault', { mode: 'vbus_drop' });
  } else {
    const usbNode = deviceNodes3D.get('USB-PORT');
    if (usbNode) {
      usbNode.deviceData.voltaje_vbus = 4.62;
      usbNode.deviceData.estado = 'CRITICO';
      currentTelemetry.summary.minUsbVbus = 4.62;
      const vbusBadge = document.getElementById('usb-min-vbus');
      if (vbusBadge) {
        vbusBadge.textContent = 'VBUS 4.62V';
        vbusBadge.style.color = '#f43f5e';
      }
      selectHardwareDevice('USB-PORT', true);
    }
  }
  showToast('Alerta simulada: Subtensión eléctrica VBUS < 4.75V', 'pink');
});

const btnRunBenchmarkEl = document.getElementById('btn-run-benchmark');
btnRunBenchmarkEl?.addEventListener('click', () => {
  if (!checkAndStartCooldown('run_benchmark_scan', [btnRunBenchmarkEl], null, CLIENT_COOLDOWN_MS)) return;
  selectHardwareDevice('STORAGE-970EVO', true);
  if (socket && socket.connected) {
    socket.emit('run_disk_benchmark', { devicePath: '/dev/nvme0n1' });
  }
  showToast('Benchmark secuencial NVMe S.M.A.R.T.: 3480 MB/s verificado', 'emerald');
});

document.getElementById('btn-reset-sim')?.addEventListener('click', () => {
  gamepadState.simulatedDriftActive = false;
  gamepadState.demoModeEnabled = false;
  gamepadState.axisDriftTimers = [0, 0, 0, 0];
  gamepadState.driftDetected = false;
  const driftBtn = document.getElementById('btn-sim-drift');
  const demoBtn = document.getElementById('btn-demo-gamepad');
  if (driftBtn) driftBtn.innerHTML = 'Drift <span class="num-mono">&gt;0.08</span>';
  if (demoBtn) demoBtn.textContent = 'Demo Mando';
  document.getElementById('drift-critical-banner')?.classList.add('hidden');

  const usbNode = deviceNodes3D.get('USB-PORT');
  if (usbNode) {
    usbNode.deviceData.voltaje_vbus = 5.02;
    usbNode.deviceData.estado = 'ESTABLE';
  }
  currentTelemetry.summary.minUsbVbus = 5.0;
  const vbusBadge = document.getElementById('usb-min-vbus');
  if (vbusBadge) {
    vbusBadge.textContent = 'VBUS 5.00V';
    vbusBadge.style.color = '#38bdf8';
  }
  if (socket && socket.connected) socket.emit('simulate_fault', { mode: 'reset' });
  updateInspectorCardUI(activeDeviceId);
  renderNavigationDeviceList();
  showToast('Telemetría restablecida a valores nominales', 'sky');
});

document.getElementById('btn-retry-glb')?.addEventListener('click', () => {
  glbLoadErrors.clear();
  preloadAllGlbAssets();
});

function renderCollapsibleTerminal(telemetry) {
  const outEl = document.getElementById('terminal-output');
  const syncEl = document.getElementById('terminal-last-sync');
  if (!outEl || !telemetry) return;

  const ts = new Date(telemetry.timestamp || Date.now()).toLocaleTimeString('es-CL', { hour12: false });
  if (syncEl) syncEl.textContent = ts;

  outEl.textContent = '';

  if (activeTerminalTab === 'dmesg') {
    (telemetry.kernelRing || []).forEach(line => {
      const row = document.createElement('div');
      row.className = 'text-slate-300 break-all';
      const prefix = document.createElement('span');
      prefix.className = 'text-slate-500';
      prefix.textContent = 'kernel> ';
      const textNode = document.createElement('span');
      textNode.textContent = sanitizeInput(line);
      row.append(prefix, textNode);
      outEl.appendChild(row);
    });
    return;
  }

  (telemetry.logs || []).forEach(l => {
    const row = document.createElement('div');
    row.className = 'flex items-baseline gap-2 border-b border-slate-800/70 py-0.5 last:border-none';
    const codeSpan = document.createElement('span');
    codeSpan.className = 'text-sky-400 font-semibold shrink-0';
    codeSpan.textContent = sanitizeInput(l.codigo_error || 'LOG');
    const msgSpan = document.createElement('span');
    msgSpan.className = 'text-slate-300 break-all';
    msgSpan.textContent = sanitizeInput(l.mensaje || '');
    row.append(codeSpan, msgSpan);
    outEl.appendChild(row);
  });
}

document.getElementById('tab-logs-db')?.addEventListener('click', e => {
  activeTerminalTab = 'db';
  e.currentTarget.className = 'studio-btn-active px-2.5 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer';
  const dmesgBtn = document.getElementById('tab-logs-dmesg');
  if (dmesgBtn) dmesgBtn.className = 'studio-btn px-2.5 py-0.5 rounded-lg text-[10px] font-medium cursor-pointer';
  renderCollapsibleTerminal(currentTelemetry);
});

document.getElementById('tab-logs-dmesg')?.addEventListener('click', e => {
  activeTerminalTab = 'dmesg';
  e.currentTarget.className = 'studio-btn-active px-2.5 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer';
  const dbBtn = document.getElementById('tab-logs-db');
  if (dbBtn) dbBtn.className = 'studio-btn px-2.5 py-0.5 rounded-lg text-[10px] font-medium cursor-pointer';
  renderCollapsibleTerminal(currentTelemetry);
});

// Pre-carga de los 11 modelos .glb reales con GLTFLoader
function preloadAllGlbAssets() {
  const files = Object.keys(GLB_ASSET_SPECS);
  totalAssetsToLoad = files.length;
  updateGlbLoadingUI(files[0], 0);
  return Promise.allSettled(files.map(f => loadGlbTemplate(f)));
}

// ----------------------------------------------------------------------------
// CONEXIÓN WEBSOCKET CON BACKOFF EXPONENCIAL (MÁX 3 INTENTOS) Y MODO SIMULADO
// ----------------------------------------------------------------------------
const WS_MAX_RECONNECT_ATTEMPTS = 3;
const WS_BASE_BACKOFF_MS = 1200;
let wsReconnectAttempts = 0;
let wsBackoffTimer = null;
let simulatedTelemetryMode = false;
let simulatedTelemetryInterval = null;

function enableSimulatedTelemetryFallback() {
  if (simulatedTelemetryMode) return;
  simulatedTelemetryMode = true;

  if (wsBackoffTimer) {
    clearTimeout(wsBackoffTimer);
    wsBackoffTimer = null;
  }

  if (socket) {
    try {
      socket.io.opts.reconnection = false;
      socket.disconnect();
    } catch {
      // Ignorar desconexión silenciosa
    }
  }

  const wsBadgeEl = document.getElementById('ws-status-badge');
  if (wsBadgeEl) {
    wsBadgeEl.textContent = 'TELEMETRÍA SIMULADA';
    wsBadgeEl.className =
      'hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/35';
  }

  if (!simulatedTelemetryInterval) {
    simulatedTelemetryInterval = setInterval(() => {
      if (document.hidden) return;
      const cpuNode = deviceNodes3D.get('CORE-CPU');
      const moboNode = deviceNodes3D.get('CORE-MOBO');
      const jitterLoad = Number((12 + Math.random() * 6).toFixed(1));
      const jitterTemp = Number((44.2 + Math.random() * 2.4).toFixed(1));
      const jitterSpeed = 4050 + Math.round(Math.random() * 150);

      if (cpuNode?.deviceData?.cpuSpecs) {
        cpuNode.deviceData.cpuSpecs.loadPct = jitterLoad;
        cpuNode.deviceData.cpuSpecs.temperatureC = jitterTemp;
        cpuNode.deviceData.cpuSpecs.currentSpeedMHz = jitterSpeed;
      }
      if (moboNode?.deviceData?.moboSpecs) {
        moboNode.deviceData.moboSpecs.cpuLoadPct = jitterLoad;
        moboNode.deviceData.moboSpecs.cpuTempC = jitterTemp;
      }
      if (currentPage === 'laboratorio' && (activeDeviceId === 'CORE-CPU' || activeDeviceId === 'CORE-MOBO')) {
        updateInspectorCardUI(activeDeviceId);
      }
    }, 2500);
  }
}

function initSocketTelemetry() {
  const wsBadgeEl = document.getElementById('ws-status-badge');
  const dbTextEl = document.getElementById('db-status-text');
  const host = window.location.hostname || 'localhost';
  const isLanOrLocalHost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  const isPublicHttps = window.location.protocol === 'https:' && !isLanOrLocalHost;

  // Pasar silenciosamente a modo de telemetría simulada si se accede desde HTTPS público
  if (isPublicHttps) {
    enableSimulatedTelemetryFallback();
    return;
  }

  // Conectar WebSockets y API dinámicamente usando window.location.hostname para soporte en teléfono/tablet por LAN
  const backendUrl = `http://${host}:3001`;
  const apiStatusUrl = `${backendUrl}/api/status`;

  // Sincronización HTTP inicial de respaldo por LAN si el servidor responde
  fetch(apiStatusUrl)
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (data && data.devices) {
        currentTelemetry = {
          ...currentTelemetry,
          ...data,
          logs: data.logs?.length ? data.logs : currentTelemetry.logs,
          kernelRing: data.kernelRing?.length ? data.kernelRing : currentTelemetry.kernelRing
        };
        syncHardwareModels3D(data.devices || []);
        renderNavigationDeviceList();
        renderCollapsibleTerminal(currentTelemetry);
        updateInspectorCardUI(activeDeviceId);
      }
    })
    .catch(() => {
      // Caída silenciosa si el endpoint HTTP no está disponible
    });

  try {
    socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false, // Gestionamos reconexión explícita con backoff exponencial (máx 3 intentos)
      timeout: 3000
    });

    const scheduleExponentialReconnect = () => {
      if (simulatedTelemetryMode) return;
      if (wsReconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) {
        enableSimulatedTelemetryFallback();
        return;
      }

      const delayMs = WS_BASE_BACKOFF_MS * Math.pow(2, wsReconnectAttempts);
      wsReconnectAttempts += 1;

      if (wsBackoffTimer) clearTimeout(wsBackoffTimer);
      wsBackoffTimer = setTimeout(() => {
        if (simulatedTelemetryMode || !socket) return;
        socket.connect();
      }, delayMs);
    };

    socket.on('connect', () => {
      wsReconnectAttempts = 0;
      simulatedTelemetryMode = false;
      if (simulatedTelemetryInterval) {
        clearInterval(simulatedTelemetryInterval);
        simulatedTelemetryInterval = null;
      }
      if (wsBadgeEl) {
        wsBadgeEl.textContent = 'WS: EN LÍNEA';
        wsBadgeEl.className =
          'hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/40';
      }
      if (activeDeviceId === 'CORE-CPU' || activeDeviceId === 'CORE-MOBO') {
        activeLiveTelemetryTargetId = null;
        syncOnDemandLiveTelemetry(activeDeviceId);
      }
    });

    socket.on('connect_error', () => {
      scheduleExponentialReconnect();
    });

    socket.on('disconnect', reason => {
      if (reason === 'io server disconnect' || simulatedTelemetryMode) {
        enableSimulatedTelemetryFallback();
        return;
      }
      scheduleExponentialReconnect();
    });

    socket.on('telemetry_update', payload => {
      if (!payload) return;
      currentTelemetry = {
        ...currentTelemetry,
        ...payload,
        logs: payload.logs?.length ? payload.logs : currentTelemetry.logs,
        kernelRing: payload.kernelRing?.length ? payload.kernelRing : currentTelemetry.kernelRing
      };

      if (dbTextEl && payload.dbStatus) {
        dbTextEl.textContent = payload.dbStatus.connected
          ? `MariaDB: ${sanitizeInput(payload.dbStatus.database)}`
          : 'Entorno: 32GB DDR4 · S.M.A.R.T. · HID';
      }

      const minVbus = payload.summary?.minUsbVbus ?? 5.0;
      const vbusBadge = document.getElementById('usb-min-vbus');
      if (vbusBadge) {
        vbusBadge.textContent = `VBUS ${Number(minVbus).toFixed(2)}V`;
        vbusBadge.style.color = minVbus < 4.75 ? '#f43f5e' : '#38bdf8';
      }

      syncHardwareModels3D(payload.devices || []);
      renderNavigationDeviceList();
      renderCollapsibleTerminal(currentTelemetry);
      updateInspectorCardUI(activeDeviceId);
    });

    socket.on('live_telemetry_tick', tick => {
      if (!tick) return;
      const cpuNode = deviceNodes3D.get('CORE-CPU');
      if (cpuNode?.deviceData?.cpuSpecs && tick.cpu) {
        Object.assign(cpuNode.deviceData.cpuSpecs, tick.cpu);
      }
      const moboNode = deviceNodes3D.get('CORE-MOBO');
      if (moboNode?.deviceData?.moboSpecs && tick.motherboard) {
        Object.assign(moboNode.deviceData.moboSpecs, tick.motherboard);
      }
      if (activeDeviceId === 'CORE-CPU' || activeDeviceId === 'CORE-MOBO') {
        updateInspectorCardUI(activeDeviceId);
      }
    });

    socket.on('peripheral_hotplug', evt => {
      const banner = document.getElementById('hotplug-live-banner');
      const detail = document.getElementById('hotplug-banner-detail');
      if (banner && evt) {
        if (detail) {
          detail.textContent = `${sanitizeInput(evt.nombre || evt.codigo_hw)} (${sanitizeInput(evt.action || 'SYNC')})`;
        }
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 4500);
      }
    });
  } catch {
    enableSimulatedTelemetryFallback();
  }
}

const btnScanNowEl = document.getElementById('btn-scan-now');
btnScanNowEl?.addEventListener('click', () => {
  if (!checkAndStartCooldown('manual_hardware_scan', [btnScanNowEl], null, CLIENT_COOLDOWN_MS)) return;
  if (socket && socket.connected && !simulatedTelemetryMode) {
    socket.emit('request_scan');
  } else {
    renderCollapsibleTerminal(currentTelemetry);
    updateInspectorCardUI(activeDeviceId);
  }
  showToast('Sincronizando telemetría de hardware (cooldown 15s)...', 'sky');
});

// ============================================================================
// 12. ARRANQUE INICIAL DE LA PLATAFORMA EN PRODUCCIÓN HAL-NEXUS
// ============================================================================
initBackgroundMotherboard();
preloadAllGlbAssets();
syncHardwareModels3D(currentTelemetry.devices);
renderHardwareCarousel();
renderNavigationDeviceList();
updateInspectorCardUI(activeDeviceId);
updateDisplayDiagnosticsDOM();
renderCollapsibleTerminal(currentTelemetry);

const initialHash = window.location.hash.replace('#', '').trim().toLowerCase();
navigateToPage(VALID_PAGES.includes(initialHash) ? initialHash : 'inicio', {
  skipHash: !initialHash,
  keepScroll: true
});

initSocketTelemetry();
animate3D();
