# README del Aplicativo

## Artemisa - Plan de Estudio Interactivo

**Plan de Estudio Interactivo**

---

## Descripción

**Plan de Estudio Interactivo** Artemisa es una aplicación web desarrollada con Next.js para el Liceo Taller San Miguel, diseñada para gestionar y consultar planes de estudio de manera interactiva. Inspirada en la filosofía institucional del colegio, que toma el arte como marco pedagógico y promueve un enfoque humanista, Artemisa permite a docentes y administradores crear, editar y visualizar planes de estudio, fomentando la creatividad y la formación integral de los estudiantes como agentes de cambio social.

Con una futura integración de la IA Picasso, Artemisa ofrecerá herramientas avanzadas para asistir a los docentes en la planificación de clases, potenciando la cosmovisión artística, espiritual e intuitiva de los estudiantes.

**Tagline: Donde el arte y la educación transforman vidas.**

**Significado y Conexión:**

- "Arte": Hace referencia directa al arte como pilar fundamental del Liceo Taller San Miguel, presente en todas sus manifestaciones y como dispositivo pedagógico.
- "Misa": Evoca la idea de una misión o propósito elevado, alineado con el enfoque humanista y trascendente de formar creadores de cultura y protagonistas de la historia.
- Conexión con Picasso: Artemisa suena sofisticado y artístico, resonando con el nombre de la IA "Picasso", que lleva el nombre de un ícono del arte. Juntos, sugieren una colaboración entre la creatividad humana y la inteligencia artificial.
- Simbolismo: En la mitología griega, Artemisa es la diosa de la caza, la naturaleza y la protección, lo que podría interpretarse como una metáfora de la búsqueda del conocimiento y la protección del desarrollo integral de los estudiantes.

---

## Características Principales

- **Autenticación Segura:** Soporte para login tradicional y SSO utilizando JWT.
- **Gestión de Planes de Estudio:** Creación, edición, visualización y desactivación de planes de estudio organizados por materia y grado.
- **Proyectos Transversales:** Posibilidad de asociar proyectos compartidos entre múltiples materias.
- **Log de Actividad:** Registro detallado de acciones (consultas y ediciones) para fines de auditoría.
- **Optimización para RAG:** Estructura de datos preparada para integrarse con sistemas de generación aumentada por recuperación.

---

## Tecnologías Utilizadas

- **Frontend:** Next.js, React
- **Backend:** Prisma ORM con PostgreSQL
- **Autenticación:** JWT para SSO y autenticación tradicional
- **Estilos:** Tailwind CSS
- **Despliegue:** Vercel (recomendado)

---

## Requisitos Previos

Antes de configurar la aplicación, asegúrate de tener instalados:

- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- **PostgreSQL** (instancia local o remota)

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/plan-estudio-interactivo.git
cd plan-estudio-interactivo
```

### 2. Instalar Dependencias

```bash
npm install
```

o

```bash
yarn install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_base_datos"
JWT_SECRET="tu_clave_secreta_para_jwt"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

- **`DATABASE_URL`:** URL de conexión a tu base de datos PostgreSQL.
- **`JWT_SECRET`:** Clave secreta para firmar y verificar tokens JWT.
- **`NEXT_PUBLIC_API_URL`:** URL base para las llamadas a la API (ajústala si es diferente en producción).

### 4. Configurar Prisma

Genera el cliente de Prisma y aplica las migraciones a la base de datos:

```bash
npx prisma generate
npx prisma db push
```

Si prefieres usar migraciones:

```bash
npx prisma migrate dev --name init
```

### 5. Ejecutar la Aplicación

Inicia el servidor de desarrollo:

```bash
npm run dev
```

o

```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Estructura del Proyecto

```bash
├── components/       # Componentes reutilizables de React
├── pages/            # Páginas de Next.js (rutas)
│   ├── api/          # Endpoints de la API
│   └── ...           # Otras páginas
├── prisma/           # Esquema y migraciones de Prisma
├── public/           # Archivos estáticos (imágenes, etc.)
├── styles/           # Estilos globales y configuración de Tailwind
├── utils/            # Utilidades y funciones auxiliares
└── ...               # Archivos de configuración (e.g., next.config.js)
```

---

## Funcionalidades Clave

### Autenticación

- **Login Tradicional:** Los usuarios pueden autenticarse con un nombre de usuario y contraseña.
- **SSO con JWT:** Soporte para autenticación mediante tokens JWT recibidos desde sistemas externos (como Phidias).

### Gestión de Planes de Estudio

- **Visualización:** Muestra planes de estudio por materia y grado, con detalles como visión, misión, objetivos y proyectos asociados.
- **Edición:** Permite a los administradores modificar la información de los planes.
- **Desactivación:** Opción para desactivar materias sin eliminar sus datos.

### Log de Actividad

- Registra todas las consultas y modificaciones realizadas en los planes de estudio, incluyendo el usuario responsable, la acción y la fecha.

---

## Despliegue

Para llevar la aplicación a producción, se recomienda usar Vercel, que simplifica el despliegue de proyectos Next.js.

1. **Conectar con Vercel:** Vincula tu repositorio de GitHub a Vercel.
2. **Configurar Variables de Entorno:** Añade las variables del archivo `.env` en la sección de configuración de Vercel.
3. **Desplegar:** Cada push a la rama principal desencadenará un despliegue automático.

---

## Contribución

Si quieres colaborar en el proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama para tu contribución (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request en el repositorio original.

---

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

---

## Contacto

Para preguntas o soporte, puedes escribir a [tu-email@dominio.com](mailto:tu-email@dominio.com).

---
