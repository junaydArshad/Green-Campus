# Green Campus App - Diagram Specifications & Visual Aids

## 📐 Diagram Creation Guide

This document provides detailed specifications for creating visual diagrams to accompany the Green Campus App presentation. Use these specifications with diagram tools like Draw.io, Lucidchart, Figma, or any diagramming software.

---

## 🏗️ 1. System Architecture Diagram

### 📋 Specifications
- **Size**: 1200x800 pixels
- **Style**: Modern, clean, with rounded rectangles
- **Color Scheme**: 
  - Frontend: #3B82F6 (Blue)
  - Backend: #10B981 (Green)
  - Database: #F59E0B (Orange)
  - External APIs: #8B5CF6 (Purple)

### 🎨 Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  📱 React Frontend (TypeScript + Tailwind CSS)                 │
│  ├── User Authentication                                        │
│  ├── Tree Management Interface                                  │
│  ├── Interactive Maps (Google Maps API)                        │
│  ├── Photo Upload & Management                                 │
│  └── Analytics Dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                               │
├─────────────────────────────────────────────────────────────────┤
│  🔌 Express.js Backend (TypeScript)                            │
│  ├── RESTful API Endpoints                                     │
│  ├── Authentication & Authorization                            │
│  ├── File Upload Handling                                      │
│  ├── Data Validation                                           │
│  └── CORS & Security Middleware                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  🗄️ SQLite Database (better-sqlite3)                          │
│  ├── Users Table                                               │
│  ├── Tree Species Table                                        │
│  ├── Trees Table                                               │
│  ├── Tree Photos Table                                         │
│  ├── Tree Measurements Table                                   │
│  └── Care Activities Table                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Creation Instructions
1. Create three main sections with rounded rectangles
2. Use different colors for each layer
3. Add icons for each component
4. Connect layers with arrows showing data flow
5. Add labels for key technologies

---

## 🔄 2. Data Flow Diagram

### 📋 Specifications
- **Size**: 1000x600 pixels
- **Style**: Flowchart with decision diamonds
- **Color Scheme**: 
  - User actions: #3B82F6 (Blue)
  - System processes: #10B981 (Green)
  - Data storage: #F59E0B (Orange)
  - Responses: #EF4444 (Red)

### 🎨 Layout Structure
```
User Action
    │
    ▼
┌─────────────┐    HTTP Request    ┌─────────────┐
│   Frontend  │ ──────────────────► │   Backend   │
│  (React)    │                    │ (Express)   │
└─────────────┘                    └─────────────┘
    │                                    │
    │                                    ▼
    │                              ┌─────────────┐
    │                              │  Database   │
    │                              │   (SQLite)  │
    │                              └─────────────┘
    │                                    │
    │                                    ▼
    │                              ┌─────────────┐
    │                              │   Query     │
    │                              │  Execution  │
    │                              └─────────────┘
    │                                    │
    ▼                                    ▼
┌─────────────┐    HTTP Response   ┌─────────────┐
│   Frontend  │ ◄────────────────── │   Backend   │
│  (React)    │                    │ (Express)   │
└─────────────┘                    └─────────────┘
    │
    ▼
UI Update
```

### 🔧 Creation Instructions
1. Start with user action at the top
2. Create boxes for Frontend, Backend, and Database
3. Add arrows showing request/response flow
4. Include decision points where needed
5. Show the complete cycle from action to UI update

---

## 🗄️ 3. Database Entity Relationship Diagram

### 📋 Specifications
- **Size**: 1400x1000 pixels
- **Style**: Entity-Relationship with crow's foot notation
- **Color Scheme**: 
  - Primary entities: #3B82F6 (Blue)
  - Secondary entities: #10B981 (Green)
  - Relationships: #6B7280 (Gray)

### 🎨 Layout Structure
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │Tree Species │         │    Trees    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ email       │         │ name        │         │ user_id (FK)│
│ password    │         │ scientific  │         │ species_id  │
│ full_name   │         │ name        │         │ latitude    │
│ location    │         │ description │         │ longitude   │
│ email_ver   │         │ care_instr  │         │ planted_date│
│ created_at  │         │ growth_rate │         │ height_cm   │
│ updated_at  │         │ mature_ht   │         │ health_stat │
└─────────────┘         │ created_at  │         │ notes       │
         │              └─────────────┘         │ created_at  │
         │                       │              │ updated_at  │
         │                       │              └─────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │         Tree Photos         │
                    ├─────────────────────────────┤
                    │ id (PK)                     │
                    │ tree_id (FK)                │
                    │ photo_url                   │
                    │ caption                     │
                    │ photo_type                  │
                    │ taken_at                    │
                    └─────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │      Tree Measurements      │
                    ├─────────────────────────────┤
                    │ id (PK)                     │
                    │ tree_id (FK)                │
                    │ height_cm                   │
                    │ measurement_date            │
                    │ notes                       │
                    │ created_at                  │
                    └─────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │       Care Activities       │
                    ├─────────────────────────────┤
                    │ id (PK)                     │
                    │ tree_id (FK)                │
                    │ activity_type               │
                    │ activity_date               │
                    │ notes                       │
                    │ created_at                  │
                    └─────────────────────────────┘
```

### 🔧 Creation Instructions
1. Create rectangular boxes for each table
2. List all fields with data types
3. Mark Primary Keys (PK) and Foreign Keys (FK)
4. Draw relationship lines with crow's foot notation
5. Use different colors for different entity types

---

## 🎨 4. User Interface Wireframes

### 📋 Specifications
- **Size**: 1200x800 pixels each
- **Style**: Clean wireframe with placeholder content
- **Color Scheme**: 
  - Background: #FFFFFF (White)
  - Borders: #E5E7EB (Light Gray)
  - Text: #374151 (Dark Gray)
  - Accents: #10B981 (Green)

### 🎨 Dashboard Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
│ [Logo] Green Campus                    [User] [Settings] ▼ │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard Overview                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Total Trees │ │Carbon Offset│ │This Month   │           │
│  │     15      │ │  45 lbs CO2 │ │     3       │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🚀 Quick Actions                                           │
│  [Plant Tree] [View Trees] [View Map] [Profile]             │
├─────────────────────────────────────────────────────────────┤
│  🌳 Recent Trees                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🌲 Oak Tree - Planted 2024-01-15 - Healthy             │ │
│  │ 🌲 Maple Tree - Planted 2024-01-10 - Needs Care        │ │
│  │ 🌲 Pine Tree - Planted 2024-01-05 - Healthy            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 Tree Detail Page Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
│ [Logo] Green Campus                    [User] [Settings] ▼ │
├─────────────────────────────────────────────────────────────┤
│  🌲 Oak Tree Details                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📍 Location Map (Google Maps)                           │ │
│  │                                                         │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📊 Tree Information                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Species     │ │ Health      │ │ Height      │           │
│  │ Oak         │ │ Healthy     │ │ 150 cm      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  📸 Photo Gallery | 📏 Growth History | 🛠️ Care Log        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Add Photo] [Add Measurement] [Add Care Activity]      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Creation Instructions
1. Use simple rectangles for all UI elements
2. Add placeholder text and numbers
3. Include navigation elements
4. Show responsive layout considerations
5. Use consistent spacing and alignment

---

## 🚀 5. User Journey Flowchart

### 📋 Specifications
- **Size**: 1000x800 pixels
- **Style**: Flowchart with decision points
- **Color Scheme**: 
  - Start/End: #10B981 (Green)
  - Actions: #3B82F6 (Blue)
  - Decisions: #F59E0B (Orange)
  - Error paths: #EF4444 (Red)

### 🎨 Layout Structure
```
                    Start
                      │
                      ▼
              ┌─────────────┐
              │   Visit     │
              │  Homepage   │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Register   │
              │   Account   │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │   Verify    │
              │   Email     │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │    Login    │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Dashboard  │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │ Plant Tree? │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │ Select Tree │
              │   Species   │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │ Choose      │
              │ Location    │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │ Add Details │
              │ & Submit    │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │   Tree      │
              │ Registered  │
              └─────────────┘
                      │
                      ▼
                    End
```

### 🔧 Creation Instructions
1. Start with a clear entry point
2. Show all major decision points
3. Include error handling paths
4. Use different shapes for different types of steps
5. Add clear labels for each step

---

## 📊 6. Feature Comparison Chart

### 📋 Specifications
- **Size**: 1200x600 pixels
- **Style**: Table format with icons
- **Color Scheme**: 
  - Headers: #374151 (Dark Gray)
  - Available: #10B981 (Green)
  - Not Available: #EF4444 (Red)
  - Partial: #F59E0B (Yellow)

### 🎨 Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Feature                    │ Green Campus │ Traditional │ Notes │
├─────────────────────────────────────────────────────────────────┤
│ Tree Registration          │     ✅       │     ❌       │       │
│ Growth Tracking            │     ✅       │     ❌       │       │
│ Photo Documentation        │     ✅       │     ❌       │       │
│ Interactive Maps           │     ✅       │     ❌       │       │
│ Care Management            │     ✅       │     ❌       │       │
│ Environmental Impact       │     ✅       │     ❌       │       │
│ User Authentication        │     ✅       │     ❌       │       │
│ Mobile Responsive          │     ✅       │     ❌       │       │
│ Real-time Updates          │     ✅       │     ❌       │       │
│ Data Analytics             │     ✅       │     ❌       │       │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Creation Instructions
1. Create a clear table structure
2. Use checkmarks and X marks for availability
3. Include comparison with traditional methods
4. Add notes column for additional context
5. Use consistent formatting throughout

---

## 🎯 7. Technology Stack Diagram

### 📋 Specifications
- **Size**: 1000x600 pixels
- **Style**: Layered architecture
- **Color Scheme**: 
  - Frontend: #3B82F6 (Blue)
  - Backend: #10B981 (Green)
  - Database: #F59E0B (Orange)
  - External: #8B5CF6 (Purple)

### 🎨 Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  React 19.1.0 │ TypeScript 4.9.5 │ Tailwind CSS 3.4.0          │
│  React Router │ Google Maps API  │ Heroicons 2.2.0              │
│  Headless UI  │ React Modal      │ Web Vitals                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Node.js      │ Express.js 4.18.2 │ TypeScript                  │
│  JWT Auth     │ bcryptjs 3.0.2    │ Multer 2.0.1                │
│  CORS         │ dotenv 17.0.0     │ nodemon 3.1.10              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  SQLite       │ better-sqlite3 12.2.0 │ File-based Storage      │
│  Auto-schema  │ Sample Data           │ Local Development        │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Creation Instructions
1. Create three distinct layers
2. List all technologies in each layer
3. Show version numbers where relevant
4. Use different colors for each layer
5. Add connecting arrows between layers

---

## 📈 8. Performance Metrics Dashboard

### 📋 Specifications
- **Size**: 800x600 pixels
- **Style**: Dashboard with charts and metrics
- **Color Scheme**: 
  - Success: #10B981 (Green)
  - Warning: #F59E0B (Yellow)
  - Error: #EF4444 (Red)
  - Info: #3B82F6 (Blue)

### 🎨 Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Metrics                         │
├─────────────────────────────────────────────────────────────────┤
│  Response Time │ Load Time │ Database │ Concurrent │ Uptime    │
│      <500ms    │  <3s      │ <100ms   │   100+     │  99.9%    │
│     ✅ Good    │  ✅ Good  │ ✅ Good  │   ✅ Good  │  ✅ Good  │
├─────────────────────────────────────────────────────────────────┤
│  📊 System Performance Chart                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    Performance Line Chart               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  🔒 Security Metrics                                         │
│  Authentication │ Password Hash │ Input Validation │ CORS    │
│      JWT        │    bcrypt     │     ✅ Active    │ Active  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Creation Instructions
1. Create metric cards with values
2. Add status indicators (✅/❌)
3. Include a performance chart area
4. Show security metrics
5. Use consistent color coding

---

## 🛠️ Diagram Creation Tools

### 🎨 Recommended Tools
1. **Draw.io (diagrams.net)** - Free, web-based, extensive shapes
2. **Lucidchart** - Professional, collaboration features
3. **Figma** - Modern design tool, great for wireframes
4. **Visio** - Microsoft Office integration
5. **Miro** - Collaborative whiteboarding

### 📋 Tool-Specific Instructions

#### Draw.io Instructions
1. Go to draw.io
2. Choose "Create New Diagram"
3. Select "Software" or "Basic" template
4. Use the shape library on the left
5. Export as PNG or SVG

#### Figma Instructions
1. Create new design file
2. Use frame tool for canvas
3. Add rectangles, text, and shapes
4. Use auto-layout for consistent spacing
5. Export as PNG or PDF

#### Lucidchart Instructions
1. Start new document
2. Choose appropriate template
3. Drag and drop shapes
4. Use smart connectors
5. Apply consistent styling

---

## 📝 Presentation Tips

### 🎯 For Technical Presentations
- Use detailed architecture diagrams
- Include code snippets where relevant
- Show database relationships clearly
- Highlight security measures

### 🎯 For Business Presentations
- Focus on user journey and features
- Show ROI and environmental impact
- Include performance metrics
- Emphasize scalability

### 🎯 For General Audiences
- Use simple, colorful diagrams
- Focus on user experience
- Show real-world applications
- Include environmental benefits

### 📊 Diagram Best Practices
1. **Consistency**: Use same colors and styles throughout
2. **Clarity**: Keep text readable and concise
3. **Simplicity**: Don't overcrowd with details
4. **Flow**: Show logical progression
5. **Labels**: Add clear titles and descriptions

---

## 🎨 Color Palette Reference

### 🎯 Primary Colors
- **Green (Primary)**: #10B981 - Success, environment, growth
- **Blue (Secondary)**: #3B82F6 - Technology, trust, stability
- **Orange (Accent)**: #F59E0B - Warning, attention, energy

### 🎯 Supporting Colors
- **Red (Error)**: #EF4444 - Errors, danger, alerts
- **Purple (External)**: #8B5CF6 - External APIs, premium features
- **Gray (Neutral)**: #6B7280 - Text, borders, backgrounds

### 🎯 Background Colors
- **White**: #FFFFFF - Primary background
- **Light Gray**: #F9FAFB - Secondary background
- **Border Gray**: #E5E7EB - Borders and dividers

---

*Use these specifications to create professional, consistent diagrams that effectively communicate the Green Campus App's architecture, features, and benefits to any audience.* 