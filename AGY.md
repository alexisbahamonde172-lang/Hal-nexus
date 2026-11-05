# 🤖 AGY.MD — Directiva Maestra de Ingeniería: HAL-Nexus v3.0 (Monolith Carbon Production & LAN Architecture)

## 📁 1. MAPA EXACTO DEL REPOSITORIO Y REGLAS DE ARCHIVOS

El repositorio mantiene esta estructura de producción conservando todos los modelos 3D reales en `assets/`:

```text
hal-nexus/
├── AGY.md                              # Directiva Maestra de Ingeniería (Producción Monolith Carbon)
├── index.html                          # Estructura HTML5 semántica Mobile-First y las 6 vistas profesionales
├── package.json                        # Scripts (Vite --host 0.0.0.0 --port 5173, Node Server) y dependencias
├── vite.config.js                      # Servidor de desarrollo y preview habilitado en LAN (0.0.0.0:5173)
├── tailwind.config.js                  # Configuración de paleta Monolith Carbon y tipografías
├── postcss.config.js                   # Configuración PostCSS
├── assets/                             # MODELOS 3D REALES (.glb) Y TEXTURAS (CONSERVAR TODOS)
│   ├── placa-madre.glb                 # Modelo principal ATX (Hero e Inspector)
│   ├── procesador.glb                  # Modelo 3D de CPU
│   ├── ram.glb                         # Módulo de memoria RAM DDR4
│   ├── hdd.glb                         # Disco duro mecánico SATA
│   ├── ssd970evo.glb                   # SSD M.2 NVMe Samsung 970 EVO
│   ├── ssd-corsair.glb                 # Unidad SSD Corsair
│   ├── usbport.glb                     # Puerto USB base en placa
│   ├── usbflash.glb                    # Memoria USB / Pendrive
│   ├── usbbodyplug.glb                 # Cuerpo de conector USB
│   ├── 2.5.glb                         # Componente auxiliar del ensamblaje USB
│   ├── xbox_360_joystick_3d_scan.glb   # Escaneo 3D de mando / joystick analógico
│   └── krom_kloud.png                  # Imagen/referencia visual del mando Krom KLOUD (NXKROMKLD)
├── src/                                # LÓGICA FRONTEND Y MOTOR GRÁFICO 3D
│   ├── main.js                         # Escena Three.js, ResizeObserver, GLTFLoader, UI dinámica y WebSockets LAN
│   └── style.css                       # Tema permanente Monolith Carbon y superficies 100% opacas
└── server/                             # BACKEND DE TELEMETRÍA Y SEGURIDAD
    ├── index.js                        # Servidor Express + WebSockets en 0.0.0.0:3001 con Rate Limiting y Broadcast
    └── db.js                           # Conexión parametrizada a base de datos MariaDB
```

---

## 👤 2. IDENTIDAD PROFESIONAL Y FLUJO DE CORREO DUAL

**HAL-Nexus | Plataforma de Telemetría y Diagnóstico de Hardware 3D** es una plataforma técnica en producción desarrollada por:

* **Autor Oficial:** **Kevin Alexis Bahamonde Cárdenas**
* **Perfil:** Técnico en Informática · Desarrollador Full-Stack & 3D Web
* **Correo Electrónico Oficial:** `alexis.bahamonde172@gmail.com`
* **Hardware Real del Entorno:** 32GB DDR4 3200MHz Dual-Channel (2x16GB), Unidades NVMe/SSD verificadas por S.M.A.R.T., Buses USB mapeados y Gamepad Inalámbrico Krom KLOUD (`NXKROMKLD`).
* **Despacho Dual de Tickets:** En `#contacto` y accesos directos, los usuarios pueden enviar reportes tanto por aplicación nativa (`mailto:`) como por navegador vía Gmail Web (`https://mail.google.com/mail/?view=cm&fs=1&to=alexis.bahamonde172@gmail.com`).

---

## 📱 3. ARQUITECTURA RESPONSIVA ESTRICTA (MOBILE-FIRST -> TABLET -> DESKTOP)

* **Base Móvil (`320px-767px`):** Diseño en 1 columna (`grid-cols-1`, `flex-col`), paddings compactos (`px-4 py-6`), títulos legibles (`text-2xl`/`text-3xl`), áreas táctiles mínimas de `44x44px` (`min-h-[44px]`) y contenedor 3D de altura controlada (`h-[280px] sm:h-[320px]`).
* **Tablet (`md: 768px-1023px`):** Reorganización a 2 columnas (`md:grid-cols-2`), espaciado intermedio (`md:px-8 md:py-10`), tarjetas balanceadas de par en par y visor 3D ajustado (`md:h-[380px]`).
* **Desktop (`lg: 1024px+` y `xl: 1280px+`):** Grillas de 3 y 12 columnas (`lg:grid-cols-3`, `lg:grid-cols-12`), Hero en dos columnas (texto a la izquierda `lg:col-span-7`, visor 3D a la derecha `lg:col-span-5` con `lg:h-[460px]`) y contenedor centrado (`max-w-7xl mx-auto`).
* **Cero Desbordamientos Horizontales:** `overflow-x-hidden w-full max-w-[100vw]` en `<html>`, `<body>` y `<main>`, junto con `break-words` en rutas de archivos y correos largos.
* **Adaptación 3D en Vivo (`ResizeObserver`):** Actualización automática de `camera.aspect`, `camera.updateProjectionMatrix()` y `renderer.setSize()`, aumentando la distancia Z de la cámara cuando `window.innerWidth < 768` para que `placa-madre.glb` nunca se recorte en pantallas verticales.

---

## 🖤 4. TEMA ÚNICO 'MONOLITH CARBON' Y MENÚS 100% OPACOS

* **Estética Monolith Carbon:** Fondo espacial negro carbón (`#050505`), tarjetas en grafito oscuro (`#0b0b0d`), bordes en gris titanio (`#27272a`) y botones píldora (`rounded-full`) en blanco titanio (`#ffffff`) con hover en plata hielo (`#e4e4e7`).
* **Visibilidad Total en Menús y Modales:** Todos los `.dropdown-menu`, menú móvil (`#mobile-nav-drawer`) y modales tienen fondo 100% sólido y opaco (`background-color: #0c0c0e` sin transparencia), borde `1px solid #27272a`, sombra `0 20px 40px rgba(0,0,0,0.95)` y `z-index: 999`.
* **Calibración PBR Three.js:** `toneMappingExposure: 0.82`, luces neutras suaves y filtrado anisotrópico máximo en todas las texturas GLB.

---

## 🌐 5. SOPORTE LAN, TÁCTIL Y BLINDAJE DE SEGURIDAD

* **Red Local (LAN) y Gestos Táctiles:** Servidor Vite en `0.0.0.0:5173` y backend Express/WS en `0.0.0.0:3001` con conexión dinámica mediante `window.location.hostname`. El canvas del Hero aplica `touch-action: pan-y` para scroll vertical fluido en móviles, mientras el Laboratorio 3D habilita rotación y zoom multitáctil.
* **Seguridad Frontend:** Sanitización XSS (`sanitizeInput` + `textContent`), campo honeypot oculto anti-bots, cooldown de 15 segundos entre envíos y pausa automática del ciclo de renderizado Three.js cuando la pestaña está oculta (`document.hidden`).
* **Seguridad Backend (`server/index.js`):** Cabeceras HTTP seguras (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`), rate-limiting en memoria de 60 req/min por IP, límite JSON de `10kb`, máximo 3 sockets por IP (`maxPayload: 16KB`) y un único intervalo global de broadcast cada `1500ms`.
