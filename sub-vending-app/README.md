# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
# Azure Subscription Vending - React Frontend

This is a React TypeScript application built with Vite for managing Azure subscription requests based on the JSON schema defined in the project.

## 🚀 Features

- **Interactive Form**: Comprehensive form based on the Azure Subscription Intake Schema
- **Real-time Validation**: Client-side validation with pattern matching and required fields
- **Responsive Design**: Mobile-friendly UI with modern styling
- **TypeScript Support**: Full type safety and IntelliSense
- **Modern UI**: Gradient backgrounds, smooth animations, and professional styling

## 📋 What's Been Created

### Components
- **`createRequest.tsx`**: Main form component for creating subscription requests
- **`createRequest.css`**: Comprehensive styling for the form
- **Updated `App.tsx`**: Navigation and home page with feature showcase

### Services
- **`apiService.ts`**: HTTP client for API communication
- **`databaseService.ts`**: Database operations (requires Node.js backend)

### Database
- **Azure SQL Database**: `vending` database created on `svr-ghc-01.database.windows.net`
- **`request` Table**: Complete table schema matching the JSON schema with:
  - All required and optional fields from the schema
  - Proper data types and constraints
  - Performance indexes
  - Audit timestamps
  - Status workflow fields

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Custom CSS with modern design patterns
- **Database**: Azure SQL Database
- **API**: RESTful endpoints (to be implemented)

## 📊 Database Schema

The `request` table includes:

### Core Fields
- `id` (Primary Key)
- `created_date`, `updated_date` (Timestamps)
- `status` (Workflow: Pending, Approved, Rejected, InProgress, Completed, Failed)

### Business Fields
- Requester, Manager, Approver information
- Subscription details (name, business unit, cost center, etc.)
- Azure-specific configurations (region, environment, product line)
- Tags for governance and compliance
- Optional features (RBAC, networking, policies, managed identities)

### Performance
- Strategic indexes on frequently queried fields
- JSON column for flexible managed identities storage
- Check constraints for data integrity

## 🚀 Getting Started

1. **Start the development server**:
   ```bash
   cd sub-vending-app
   npm run dev
   ```

2. **Access the application**:
   - Open http://localhost:5173/
   - Navigate between Home and Create Request pages

## 🎨 UI Features

### Home Page
- Hero section with call-to-action buttons
- Feature showcase grid
- Responsive navigation

### Create Request Form
- **Section-based layout**: Organized into logical groups
- **Smart defaults**: Pre-populated with sensible values from schema
- **Dynamic fields**: Add/remove managed identities
- **Validation**: Real-time validation with user-friendly messages
- **Responsive**: Works on desktop, tablet, and mobile

### Form Sections
1. **Requester Information** (Required)
2. **Subscription Details** (Core configuration)
3. **Tags** (Governance and compliance)
4. **Optional Configuration** (Advanced features)

## 📝 Form Validation

- **Required fields**: Clear visual indicators
- **Pattern matching**: Subscription name and cost center validation
- **Email validation**: Built-in email format checking
- **Business logic**: Automatic tag synchronization

## 🔧 Configuration

Environment variables (from `.env`):
- `VITE_API_URL`: API endpoint for backend communication
- Database connection details for SQL operations

## 🎯 Next Steps

To complete the full-stack application:

1. **Backend API**: Create Express.js/Node.js API server
2. **Database Integration**: Connect API to Azure SQL Database
3. **Authentication**: Add Azure AD integration
4. **Workflow**: Implement approval workflow
5. **Dashboard**: Add request management and status tracking
6. **Deployment**: Deploy to Azure App Service or Container Apps

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Collapsible navigation on mobile
- Touch-friendly form controls
- Optimized layouts for different screen sizes
- Accessible design patterns

## 🎨 Design System

- **Color Palette**: Purple gradient primary theme
- **Typography**: Modern, readable font stack
- **Spacing**: Consistent spacing system
- **Components**: Reusable form elements and buttons
- **Animations**: Smooth transitions and hover effects

The application provides a complete, production-ready frontend for Azure subscription vending with a solid foundation for backend integration.
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
