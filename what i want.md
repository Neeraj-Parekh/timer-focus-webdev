# 🎯 **COMPLETE PROJECT DOCUMENTATION: FOCUS TIMER PRO**
## *An AI-Powered Productivity System for ADHD & Deep Work*

***

# 📖 **THE STORY: WHY THIS APP EXISTS**

## **The Problem Statement**

You are Rajesh, an engineering student in India with specific challenges:

### **Attention & Focus Issues:**
- **Short-term attention span** - Difficulty maintaining focus on single tasks beyond 20-30 minutes
- **Easy distraction** - Thoughts wander frequently, external noises break concentration
- **Memory/thought overflow** - Multiple thoughts competing for attention simultaneously
- **Task switching difficulty** - Hard to transition between activities smoothly
- **Hyperfocus traps** - Sometimes stuck on one thing, missing other important tasks
- **Decision fatigue** - Too much mental energy spent deciding "what to do next"

### **Current Life Context:**
- Pursuing IITM BS degree + ENTC engineering (dual workload)
- Working on: DSP coursework, SAR image processing, TechFest IIT Bombay, CANSAT 2026, ISL recognition
- Traveling between Pune and Mumbai for competitions
- Living in hostel/shared spaces (noisy environment)
- Limited time but high ambitions
- Need to balance: academics, projects, hackathons, personal life

### **Existing Solutions Fail Because:**
1. **Generic Pomodoro apps** - Don't understand your specific task patterns
2. **Simple to-do lists** - No automatic task rotation, require manual intervention
3. **Timer apps** - Boring, no sensory feedback, disappear when needed
4. **Productivity apps** - Too complex, require too much setup, don't adapt to ADHD
5. **No personalization** - Don't learn from your patterns or predict your needs

***

## **The Vision: What You're Building**

### **Core Philosophy:**
> "A productivity companion that understands MY brain, adapts to MY patterns, and keeps ME accountable without overwhelming me."

### **The Complete Solution:**

**Layer 1: Task Management**
- Organize life into areas: Academic, Projects, Personal, Leisure
- Eisenhower matrix for prioritization (Urgent/Important quadrants)
- Hierarchical folders with sub-categories
- Quick-capture brain dump for distractions
- Spaced repetition scheduling for revision

**Layer 2: Intelligent Rotation**
- Auto-rotating task sequences (inner loops + sequential tasks)
- Complex patterns: Task 1 → 2 → 3 → 4 → 2 → 1 → 3 (custom rotation logic)
- Visual logic canvas with IF/ELSE gates, loops, conditions
- Dynamic time adjustment based on performance
- Break insertion based on fatigue detection

**Layer 3: Multi-Sensory Experience**
- Floating timer overlay (visible on any screen)
- Always-On Display support (visible when locked)
- Pixel art visual styles (hourglass, Pac-Man, Space Invaders, Tetris, etc.)
- Screen flash alerts (full-screen color pulse)
- Custom sound alerts + audio masking (white/pink noise)
- Haptic feedback patterns

**Layer 4: AI & Machine Learning**
- Built-in scheduling model (learns your patterns)
- Custom TFLite model support
- Fine-tuned on personal WhatsApp/diary data
- Predicts optimal task order, duration, break timing
- Adapts in real-time based on focus quality

**Layer 5: Gamification & Progress**
- Statistics and analytics (focus time, completion rate, streaks)
- Achievement system (medals, levels, unlockables)
- Calendar heatmap (like GitHub contributions)
- Focus quality scoring
- Personal records and milestones

***

## **The Journey: How You Use It**

### **Morning (9:00 AM):**
1. Wake up, check app shows today's priorities in Eisenhower matrix
2. See 3 urgent tasks: DSP exam prep, SAR project milestone, TechFest slides
3. App suggests: "Start with DSP (peak morning focus time based on your patterns)"
4. Create rotation: DSP 25m → Break 5m → DSP 25m → SAR 30m → Break 10m
5. Choose pixel hourglass timer (tomato style from your inspiration image )[1]
6. Tap Start → White noise begins, timer appears floating over your notes
7. Every second: pixel blinks and falls
8. Every minute: hourglass glows briefly
9. At 25:00 → Full screen cyan flash + FM sweep sound + vibration
10. Break auto-starts with Pac-Man eating dots timer

### **Mid-Session (11:30 AM):**
1. Working on SAR code, suddenly remember: "Email Prof. Sharma!"
2. Tap floating timer → Quick brain dump popup
3. Voice-to-text: "Email professor about deadline extension"
4. Saved to Personal > Errands folder
5. Timer continues → No focus break, no context switch

### **Afternoon (2:00 PM):**
1. Completed 5 tasks, feeling tired
2. App detects: Focus quality dropped to 65% (based on completion times)
3. ML suggests: "Force 20-minute break before next task"
4. Shows suggestion: Walk outside + hydration reminder
5. After break: Energy restored, switches to medium-difficulty task (not hard DSP)

### **Evening (8:00 PM):**
1. Open app statistics
2. See: 6h 45m focus time, 9/10 tasks completed, 91% avg focus quality
3. Earned "Gold Medal" achievement (5+ hours focused)
4. 12-day streak maintained
5. Calendar heatmap shows consistent pattern
6. ML learns: "Rajesh is most productive 9-11 AM and 2-4 PM"

***

# 🏗️ **COMPLETE ARCHITECTURE**

## **Technology Stack**

### **Frontend (Mobile App):**
```
Framework: Jetpack Compose (Kotlin) or React Native
UI: Material Design 3 with custom themes
State Management: ViewModel + Flows (Kotlin) or Redux (React)
Navigation: Compose Navigation or React Navigation
Canvas Drawing: Custom Compose Canvas or React Native Canvas
Animations: Jetpack Compose Animation or Reanimated
```

### **Backend (Local-First):**
```
Database: Room (SQLite) with auto-migration support
Preferences: DataStore (encrypted)
File Storage: Internal storage for ML models
Background Processing: WorkManager for scheduled tasks
Notifications: FCM for cross-device sync (optional)
```

### **AI/ML Stack:**
```
Primary Model: Gemma 2B TFLite (1.1 GB, INT4 quantized)
Secondary Model: Custom LSTM (500 KB for duration prediction)
Tertiary Model: LightGBM (5 MB for attention tracking)
Training: TensorFlow/Keras → Convert to TFLite
Inference: TensorFlow Lite Interpreter
On-device Training: Federated Learning (future)
```

### **Audio System:**
```
Timer Sounds: Custom sound library + user uploads
Audio Masking: Programmatically generated white/pink noise
Sound Engine: MediaPlayer API with background playback
Audio Focus: Handle phone calls, music interruptions
```

### **Visual Rendering:**
```
Pixel Art Timers: Custom Canvas drawing with frame-by-frame animation
Floating Overlay: WindowManager with TYPE_APPLICATION_OVERLAY
AOD Support: DreamService for Always-On Display integration
Screen Flash: Full-screen overlay with color animation
Progress Indicators: SVG paths with stroke-dasharray animation
```

***

## **Database Schema (Room)**

### **Entity: Task**
```kotlin
@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val description: String? = null,
    val duration: Int, // minutes
    val color: String, // hex color
    val icon: String? = null,
    val folderId: Long,
    val priority: Int, // 1-4 (Eisenhower quadrant)
    val difficulty: Int, // 1-5
    val isInbox: Boolean = false,
    val order: Int = 0,
    val estimatedPomodoros: Int = 0,
    val createdAt: Long,
    val updatedAt: Long,
    val deadline: Long? = null,
    val tags: String? = null, // JSON array
    val isArchived: Boolean = false
)
```

### **Entity: TaskFolder**
```kotlin
@Entity(tableName = "task_folders")
data class TaskFolder(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val icon: String,
    val color: String,
    val parentId: Long? = null, // for sub-folders
    val sortOrder: Int,
    val isSystemFolder: Boolean = false, // Academic, Projects, etc.
    val focusTimeToday: Long = 0,
    val createdAt: Long
)
```

### **Entity: FocusSession**
```kotlin
@Entity(tableName = "focus_sessions")
data class FocusSession(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val taskId: Long,
    val plannedDuration: Int, // seconds
    val actualDuration: Int, // seconds
    val completedAt: Long,
    val focusQuality: Float, // 0.0-1.0
    val pauseCount: Int,
    val skipReason: String? = null,
    val timeOfDay: Int, // hour 0-23
    val dayOfWeek: Int, // 1-7
    val energyLevel: Int, // 1-10 (user-rated)
    val wasCompleted: Boolean,
    val interruptionCount: Int,
    val rotationCycle: Int // which cycle in sequence
)
```

### **Entity: RotationPattern**
```kotlin
@Entity(tableName = "rotation_patterns")
data class RotationPattern(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val taskSequence: String, // JSON: ["1","2","3","4","2","1","3"]
    val repeatCount: Int,
    val isActive: Boolean,
    val createdAt: Long,
    val lastUsedAt: Long? = null
)
```

### **Entity: LogicNode (Canvas)**
```kotlin
@Entity(tableName = "logic_nodes")
data class LogicNode(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val canvasId: Long,
    val nodeType: String, // TASK, DECISION, LOOP, GATE, TIME_CONDITION
    val taskId: Long? = null,
    val condition: String? = null, // JSON condition object
    val positionX: Float,
    val positionY: Float,
    val metadata: String? = null // JSON for node-specific data
)
```

### **Entity: NodeConnection**
```kotlin
@Entity(tableName = "node_connections")
data class NodeConnection(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fromNodeId: Long,
    val toNodeId: Long,
    val conditionResult: String, // YES, NO, ALWAYS
    val order: Int
)
```

### **Entity: Statistics**
```kotlin
@Entity(tableName = "daily_statistics")
data class DailyStatistics(
    @PrimaryKey val date: String, // YYYY-MM-DD
    val totalFocusSeconds: Long,
    val completedTasks: Int,
    val skippedTasks: Int,
    val averageFocusQuality: Float,
    val sessionCount: Int,
    val longestStreak: Int,
    val categoriesWorked: String, // JSON array
    val peakFocusHour: Int
)
```

### **Entity: Achievement**
```kotlin
@Entity(tableName = "achievements")
data class Achievement(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val description: String,
    val iconName: String,
    val requirement: String, // JSON condition
    val unlockedAt: Long? = null,
    val tier: String // BRONZE, SILVER, GOLD
)
```

### **Entity: PersonalDataTraining**
```kotlin
@Entity(tableName = "training_data")
data class TrainingData(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sourceType: String, // WHATSAPP, DIARY, CALENDAR, MANUAL
    val content: String,
    val timestamp: Long,
    val extractedTasks: String? = null, // JSON array
    val sentiment: Float? = null, // -1.0 to 1.0
    val wasProcessed: Boolean = false,
    val addedToTraining: Boolean = false
)
```

***

## **ML Model Architecture**

### **Model 1: Task Duration Predictor (LSTM)**
```python
# Input shape: (batch_size, 10, 15)
# 10 timesteps = last 10 task completions
# 15 features per timestep

Features:
1. task_id (categorical, embedded)
2. planned_duration (minutes)
3. time_of_day (hour, 0-23)
4. day_of_week (1-7)
5. energy_level (1-10)
6. previous_focus_quality (0-1)
7. break_since_last (minutes)
8. deadline_proximity (days)
9. task_difficulty (1-5)
10. completion_rate_recent (0-1)
11. pause_count_recent (count)
12. interruption_count_recent (count)
13. weather_condition (optional, categorical)
14. sleep_quality_last_night (1-10, optional)
15. caffeine_intake (bool, optional)

# Output: [predicted_duration, confidence_score, should_take_break]

Model Architecture:
- Embedding layer for task_id (dim=32)
- LSTM(128, return_sequences=True)
- Dropout(0.2)
- LSTM(64, return_sequences=False)
- Dropout(0.2)
- Dense(32, activation='relu')
- Dense(3, activation='linear')

Training:
- Loss: MSE for duration, Binary Crossentropy for break
- Optimizer: Adam (lr=0.001)
- Epochs: 50-100
- Batch size: 32
- Validation split: 20%

Model size after quantization: ~500 KB
Inference time: <10ms on mobile
```

### **Model 2: Next Task Recommender (DQN)**
```python
# Reinforcement Learning approach

State Space (20 features):
1. Current time (hour, normalized 0-1)
2. Day of week (one-hot encoded, 7 dims)
3. Energy level (0-1)
4. Tasks completed today (count)
5. Time focused today (minutes)
6. Last task focus quality (0-1)
7. Time since last break (minutes)
8. Remaining tasks count
9. Highest priority task urgency (0-1)
10. Average task difficulty remaining (0-1)
11. Deadline pressure (nearest deadline in days)
12. Focus quality trend (improving/declining)
13. Historical success rate for current time slot (0-1)

Action Space:
- Task ID to start next (dynamic, up to 50 tasks)

Reward Function:
reward = (
    +1.0 * task_completed
    +0.5 * focus_quality
    -0.3 * pause_count
    -0.5 * skip_without_completion
    +0.8 * deadline_met
    +0.3 * maintained_energy
)

DQN Architecture:
- Input: State vector (20 dims)
- Dense(128, activation='relu')
- Dense(64, activation='relu')
- Dense(32, activation='relu')
- Output: Q-values for each action (task)

Training:
- Experience replay buffer (10,000 transitions)
- Target network update every 1000 steps
- Epsilon-greedy exploration (start=1.0, decay=0.995, min=0.1)
- Gamma (discount): 0.95

Model size: ~10 MB
Training time: 2-4 weeks of user data
```

### **Model 3: Gemma 2B Fine-Tuned (Conversational AI)**
```python
# Fine-tuning on personal data

Base Model: google/gemma-2b-it

Training Data Format:
{
  "messages": [
    {
      "role": "user",
      "content": "It's 9 AM, I have DSP exam in 3 days. What should I focus on?"
    },
    {
      "role": "assistant",
      "content": "Based on your WhatsApp logs (Dec 20, 24), you typically focus best on theoretical subjects 9-11 AM. Your diary shows DSP Z-Transform took you 40 minutes last time with 85% focus. Start with that chapter now. Block 45 minutes, then take 10-min break."
    }
  ]
}

Fine-tuning Config:
- Method: QLoRA (4-bit quantization)
- Learning rate: 2e-5
- Batch size: 4 (gradient accumulation 4)
- Epochs: 3-5
- Max sequence length: 512
- LoRA rank: 16
- LoRA alpha: 32

Training Data Sources:
1. WhatsApp chat history (5,000+ messages)
2. Diary entries (200+ entries)
3. Task completion logs (1,000+ sessions)
4. Explicit feedback ("this worked", "this didn't")

Model size after quantization: 1.1 GB
Inference time: ~2 seconds per response
```

### **Model 4: Attention Quality Detector (LightGBM)**
```python
# Real-time focus quality estimation

Input Features (24 total):
1. Screen interactions per minute
2. App switches count
3. Notification checks
4. Phone unlocks
5. Typing speed (WPM)
6. Mouse/touch movement patterns
7. Face orientation (front camera, optional)
8. Head movement (accelerometer)
9. Time in foreground app
10. Audio input level (mic, for voice detection)
11. Ambient light changes
12. Time of day
13. Task duration elapsed
14. Planned vs actual progress
15. Pause button presses
16. Manual focus quality ratings (calibration)
17-24. Historical context features

Output: Focus quality score (0.0-1.0)

LightGBM Config:
- Objective: regression
- Metric: MAE
- Num leaves: 31
- Learning rate: 0.05
- Max depth: 7
- Boosting type: gbdt
- Num iterations: 100

Model size: ~5 MB
Inference: Real-time (every 10 seconds)
```

***

## **Component Architecture**

### **App Modules:**

```
/app
├── /presentation (UI Layer)
│   ├── /screens
│   │   ├── HomeScreen.kt
│   │   ├── TimerScreen.kt
│   │   ├── TaskListScreen.kt
│   │   ├── TaskEditScreen.kt
│   │   ├── CanvasEditorScreen.kt
│   │   ├── EisenhowerMatrixScreen.kt
│   │   ├── StatisticsScreen.kt
│   │   ├── SettingsScreen.kt
│   │   └── OnboardingScreen.kt
│   ├── /components
│   │   ├── /timer
│   │   │   ├── FloatingTimer.kt
│   │   │   ├── PixelHourglassTimer.kt
│   │   │   ├── SpaceInvaderTimer.kt
│   │   │   ├── PacManTimer.kt
│   │   │   ├── TetrisTimer.kt
│   │   │   ├── AnalogClockTimer.kt
│   │   │   └── ProgressRingTimer.kt
│   │   ├── /tasks
│   │   │   ├── TaskCard.kt
│   │   │   ├── TaskListItem.kt
│   │   │   ├── FolderCard.kt
│   │   │   └── QuickCaptureDialog.kt
│   │   ├── /canvas
│   │   │   ├── NodeCanvas.kt
│   │   │   ├── TaskNode.kt
│   │   │   ├── DecisionNode.kt
│   │   │   ├── LoopNode.kt
│   │   │   └── ConnectionLine.kt
│   │   └── /common
│   │       ├── ColorPicker.kt
│   │       ├── IconPicker.kt
│   │       └── DateTimePicker.kt
│   └── /viewmodels
│       ├── TimerViewModel.kt
│       ├── TaskViewModel.kt
│       ├── CanvasViewModel.kt
│       ├── StatisticsViewModel.kt
│       └── SettingsViewModel.kt
│
├── /domain (Business Logic)
│   ├── /models
│   │   ├── Task.kt
│   │   ├── TaskFolder.kt
│   │   ├── FocusSession.kt
│   │   ├── RotationPattern.kt
│   │   ├── LogicNode.kt
│   │   └── Achievement.kt
│   ├── /usecases
│   │   ├── CreateTaskUseCase.kt
│   │   ├── UpdateTaskUseCase.kt
│   │   ├── StartTimerUseCase.kt
│   │   ├── CompleteTaskUseCase.kt
│   │   ├── PredictNextTaskUseCase.kt
│   │   ├── CalculateStatisticsUseCase.kt
│   │   └── EvaluateLogicCanvasUseCase.kt
│   └── /repositories
│       ├── TaskRepository.kt
│       ├── SessionRepository.kt
│       ├── StatisticsRepository.kt
│       └── PreferencesRepository.kt
│
├── /data (Data Layer)
│   ├── /local
│   │   ├── /database
│   │   │   ├── AppDatabase.kt
│   │   │   ├── TaskDao.kt
│   │   │   ├── SessionDao.kt
│   │   │   ├── StatisticsDao.kt
│   │   │   └── Migrations.kt
│   │   ├── /datastore
│   │   │   └── PreferencesManager.kt
│   │   └── /models
│   │       └── (Data entities)
│   └── /repositories
│       └── (Repository implementations)
│
├── /ml (Machine Learning)
│   ├── /models
│   │   ├── TaskDurationPredictor.kt
│   │   ├── NextTaskRecommender.kt
│   │   ├── GemmaScheduler.kt
│   │   └── AttentionDetector.kt
│   ├── /training
│   │   ├── DataCollector.kt
│   │   ├── ModelTrainer.kt
│   │   └── ModelEvaluator.kt
│   └── /inference
│       ├── TFLiteInterpreter.kt
│       └── ModelLoader.kt
│
├── /audio (Audio System)
│   ├── AudioManager.kt
│   ├── WhiteNoiseGenerator.kt
│   ├── NotificationSoundPlayer.kt
│   └── AudioMaskingEngine.kt
│
├── /service (Background Services)
│   ├── TimerService.kt
│   ├── FloatingOverlayService.kt
│   ├── AODService.kt
│   ├── NotificationManager.kt
│   └── BackgroundSyncService.kt
│
├── /utils
│   ├── TimeFormatter.kt
│   ├── ColorUtils.kt
│   ├── NotificationHelper.kt
│   ├── PermissionHelper.kt
│   └── FileUtils.kt
│
└── /di (Dependency Injection)
    ├── AppModule.kt
    ├── DatabaseModule.kt
    ├── RepositoryModule.kt
    └── MLModule.kt
```

***

# ✅ **COMPLETE FEATURE LIST WITH PRIORITIES**

## **PHASE 1: MVP - Core Functionality (Week 1-4)**

### **Priority: CRITICAL (Must Have)**

**1.1 Basic Task Management**
- [x] ✅ Create task with name, duration
- [x] ✅ Edit task properties
- [x] ✅ Delete task (with confirmation)
- [x] ✅ View task list
- [x] ✅ Mark task as complete
- [x] ✅ Set task color
- [x] ✅ Save tasks to IndexedDB (PWA)
- [x] ✅ Load tasks on app start
- [ ] Default task templates

**1.2 Simple Timer**
- [x] ✅ Start countdown timer
- [x] ✅ Pause timer
- [x] ✅ Resume timer
- [x] ✅ Stop/reset timer
- [x] ✅ Display remaining time (MM:SS format)
- [x] ✅ Show current task name
- [x] ✅ Update every second
- [x] ✅ Handle timer completion

**1.3 Task Rotation**
- [x] ✅ Auto-advance to next task
- [x] ✅ Loop through task list
- [x] ✅ Track current task index
- [x] ✅ Show "Next task" preview
- [x] ✅ Skip to next task manually
- [x] ✅ Reset rotation to start

**1.4 Basic Notifications**
- [x] ✅ Request notification permission
- [x] ✅ Play sound on timer complete
- [x] ✅ Show notification when timer ends
- [x] ✅ Vibrate on completion (if supported)
- [x] ✅ Notification with task name

**1.5 Essential UI**
- [x] ✅ Home screen with task list
- [x] ✅ Timer display screen
- [x] ✅ Start/pause/stop controls
- [x] ✅ Task add/edit form
- [x] ✅ Dark theme
- [x] ✅ Mobile responsive layout

***

## **PHASE 2: Enhanced UX (Week 5-8)**

### **Priority: HIGH (Should Have)**

**2.1 Visual Timer Styles**
- [x] ✅ Analog clock style (rotating hand)
- [x] ✅ Progress ring (circular)
- [x] ✅ Linear progress bar
- [ ] Flip clock numbers
- [ ] Basic pixel art timer (simple)
- [x] ✅ Toggle between styles in settings

**2.2 Task Folders & Organization**
- [x] ✅ Create folders (Academic, Projects, Personal)
- [x] ✅ Assign tasks to folders
- [x] ✅ View tasks by folder
- [x] ✅ Folder colors and icons
- [x] ✅ Quick folder switching
- [x] ✅ Folder statistics (time spent)

**2.3 Session Management**
- [x] ✅ Track completed tasks per session
- [x] ✅ Show session progress
- [x] ✅ Pause entire session
- [x] ✅ Resume session from last task
- [x] ✅ End session summary

**2.4 Enhanced Sounds**
- [x] ✅ Multiple built-in alert sounds
- [x] ✅ Volume control for alerts
- [x] ✅ Preview sounds before selection
- [x] ✅ Different sounds for work/break
- [x] ✅ Option to disable sounds

**2.5 Basic Statistics**
- [x] ✅ Today's focus time
- [x] ✅ Tasks completed today
- [x] ✅ Current streak (days)
- [x] ✅ Simple bar chart (last 7 days)
- [x] ✅ Export statistics as CSV

***

## **PHASE 3: Advanced Features (Week 9-16)**

### **Priority: MEDIUM (Nice to Have)**

**3.1 Eisenhower Matrix**
- [x] ✅ 4-quadrant layout (PWA)
- [x] ✅ Drag-drop tasks between quadrants (PWA)
- [ ] Auto-suggest quadrant based on keywords
- [x] ✅ Filter by quadrant (PWA)
- [x] ✅ Start focus session from quadrant (PWA)
- [x] ✅ Quadrant-specific stats

**3.2 Complex Task Rotation**
- [x] ✅ Custom rotation patterns
- [x] ✅ Inner loops (repeating tasks)
- [x] ✅ Sequential task chains
- [x] ✅ Save/load rotation templates
- [x] ✅ Visual rotation editor
- [x] ✅ Preview rotation sequence

**3.3 Brain Dump / Quick Capture**
- [x] ✅ Floating quick-add button
- [ ] Voice-to-text input
- [x] ✅ Save to inbox automatically
- [x] ✅ Review inbox screen
- [x] ✅ Process inbox items to folders
- [x] ✅ Snooze inbox items

**3.4 Audio Masking**
- [x] ✅ White noise generator (PWA)
- [x] ✅ Pink noise generator (PWA)
- [x] ✅ Brown noise generator
- [x] ✅ Ambient sounds (rain, coffee shop, fireplace, forest) (PWA)
- [x] ✅ Volume control for masking (PWA)
- [x] ✅ Mix with alert sounds
- [x] ✅ Background playback (PWA)

**3.5 Pixel Art Timer Collection**
- [ ] Hourglass (tomato/sand falling)
- [ ] Pac-Man eating dots
- [ ] Space Invaders countdown
- [ ] Tetris blocks stacking
- [ ] Candle burning down
- [ ] Pixel heart monitor
- [ ] Retro digital watch
- [ ] Custom pixel art upload

**3.5 Audio Masking**
- [x] ✅ White noise generator (PWA)
- [x] ✅ Pink noise generator (PWA)
- [x] ✅ Brown noise generator (PWA)
- [x] ✅ Ambient sounds (rain, coffee shop, fireplace, forest) (PWA)
- [x] ✅ Volume control for masking (PWA)
- [ ] Mix with alert sounds
- [x] ✅ Background playback (PWA)

**3.6 Gamification** - *EXCLUDED PER USER REQUEST*
- [ ] Achievement system
- [ ] Levels and XP
- [ ] Unlock visual styles by progress
- [ ] Daily challenges
- [ ] Streak bonuses
- [ ] Leaderboard (optional, local only)

**3.7 Advanced Statistics**
- [x] ✅ Weekly/monthly reports (PWA)
- [x] ✅ Focus quality trends
- [x] ✅ Peak productivity hours (PWA)
- [x] ✅ Task completion rate
- [x] ✅ Category breakdown
- [x] ✅ Calendar heatmap (PWA)
- [x] ✅ Export as PDF report (PWA)

***

## **PHASE 4: AI & ML Integration (Week 17-24)**

### **Priority: LOW (Future Enhancement)**

**4.1 LSTM Duration Prediction**
- [ ] Collect historical session data
- [ ] Train LSTM model on user data
- [ ] Convert to TFLite
- [ ] Integrate in app
- [ ] Predict task duration
- [ ] Show prediction vs actual
- [ ] Model retraining pipeline

**4.2 DQN Task Scheduling**
- [ ] Implement state space
- [ ] Define reward function
- [ ] Train DQN on user choices
- [ ] Suggest optimal next task
- [ ] Explain reasoning
- [ ] User feedback loop
- [ ] Model improvement over time

**4.3 Attention Quality Detection**
- [ ] Track phone usage patterns
- [ ] Monitor app switches
- [ ] Detect focus drops
- [ ] Real-time quality score
- [ ] Break suggestions based on quality
- [ ] Adjust task difficulty dynamically

**4.4 Personal Data Training**
- [ ] Import WhatsApp chat history
- [ ] Parse diary entries
- [ ] Extract task mentions
- [ ] Create training dataset
- [ ] Fine-tune Gemma 2B
- [ ] Convert to TFLite
- [ ] Deploy personalized model

**4.5 Conversational AI**
- [ ] "What should I do?" query
- [ ] Natural language task advice
- [ ] Context-aware responses
- [ ] Reference past patterns
- [ ] Motivational messages
- [ ] Chat interface

**4.6 Dynamic Time Adjustment**
- [ ] Track task repetition
- [ ] Adjust duration based on performance
- [ ] Increment if focus drops
- [ ] Decrement if completing early
- [ ] Reset after break
- [ ] Max/min duration limits

***

## **PHASE 5: Advanced Visualizations (Week 25-32)**

### **Priority: POLISH (If Time Allows)**

**5.1 Logic Canvas**
- [ ] Infinite canvas implementation
- [ ] Task nodes (draggable)
- [ ] Decision nodes (IF/ELSE)
- [ ] Loop nodes
- [ ] Time gates
- [ ] AND/OR gates
- [ ] Connection drawing
- [ ] Zoom/pan controls
- [ ] Save/load canvas
- [ ] Execute logic flow

**5.2 Floating Overlay**
- [ ] Request overlay permission
- [ ] Floating timer window
- [ ] Draggable anywhere
- [ ] Minimize/expand controls
- [ ] Always on top
- [ ] Click-through mode
- [ ] Custom size/opacity

**5.3 AOD Integration**
- [ ] DreamService implementation
- [ ] Display timer on locked screen
- [ ] Low-power mode
- [ ] OLED-optimized display
- [ ] Task name + countdown
- [ ] Minimal battery drain

**5.4 Screen Flash Alerts**
- [ ] Full-screen overlay
- [ ] Color customization
- [ ] Pulse animation
- [ ] Fade in/out
- [ ] Duration control
- [ ] Disable option

**5.5 Advanced Animations**
- [ ] Smooth transitions
- [ ] Particle effects
- [ ] Glow effects
- [ ] Shake animations
- [ ] Confetti on completion
- [ ] Custom animation speeds

***

## **PHASE 6: Cloud & Sync (Week 33+)**

### **Priority: OPTIONAL (Cloud Features)**

**6.1 Cross-Device Sync**
- [ ] Firebase/Supabase backend
- [ ] User authentication
- [ ] Sync tasks across devices
- [ ] Conflict resolution
- [ ] Offline-first architecture
- [ ] Sync status indicator

**6.2 Backup & Restore**
- [ ] Export all data to JSON
- [ ] Import from backup
- [ ] Auto-backup to cloud
- [ ] Restore from cloud
- [ ] Backup encryption

**6.3 Collaboration (Optional)**
- [ ] Share tasks with others
- [ ] Team task lists
- [ ] Shared statistics
- [ ] Accountability partners
- [ ] Group challenges

***

# 📋 **DETAILED TODO CHECKLIST**

## **Pre-Development**

### **Planning & Design:**
- [ ] Create detailed mockups for each screen
- [ ] Define color palette and typography
- [ ] Create icon assets (192x192, 512x512)
- [ ] Design pixel art sprites
- [ ] Write user stories for each feature
- [ ] Create flowcharts for user journeys
- [ ] Plan database migrations
- [ ] Design API structure (if backend)

### **Environment Setup:**
- [ ] Install Android Studio / VS Code
- [ ] Set up Kotlin/Java or React Native environment
- [ ] Configure Gradle / npm dependencies
- [ ] Set up version control (Git)
- [ ] Create GitHub repository
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure code linting (ktlint / ESLint)
- [ ] Set up testing framework (JUnit / Jest)

### **ML Model Preparation:**
- [ ] Download Gemma 2B TFLite from Hugging Face
- [ ] Set up TensorFlow/Keras environment
- [ ] Prepare training data format
- [ ] Create data preprocessing scripts
- [ ] Set up model training pipeline
- [ ] Configure TFLite conversion scripts

***

## **Development Tasks**

### **Week 1-2: Database & Core Logic**
- [ ] Create Room database schema
- [ ] Implement TaskDao with CRUD operations
- [ ] Create SessionDao for tracking
- [ ] Implement StatisticsDao
- [ ] Write migration scripts (version 1)
- [ ] Create repository pattern implementations
- [ ] Write unit tests for database operations
- [ ] Implement LocalStorage for preferences

### **Week 3-4: Basic UI**
- [ ] Set up Jetpack Compose / React Navigation
- [ ] Create theme (colors, typography)
- [ ] Implement HomeScreen with task list
- [ ] Create TaskCard component
- [ ] Implement Add Task screen
- [ ] Create Edit Task dialog
- [ ] Implement Timer display screen
- [ ] Add Start/Pause/Stop buttons
- [ ] Create countdown logic
- [ ] Test UI on different screen sizes

### **Week 5-6: Timer Functionality**
- [ ] Implement timer service (foreground)
- [ ] Create notification channel
- [ ] Build timer state machine
- [ ] Add sound playback on completion
- [ ] Implement vibration feedback
- [ ] Create task rotation logic
- [ ] Add skip/reset functionality
- [ ] Handle app lifecycle (pause/resume)
- [ ] Test timer accuracy over long periods
- [ ] Handle edge cases (low battery, calls)

### **Week 7-8: Task Management**
- [ ] Implement folder creation
- [ ] Add folder color picker
- [ ] Create icon selection UI
- [ ] Implement task filtering by folder
- [ ] Add search functionality
- [ ] Implement drag-to-reorder tasks
- [ ] Create task templates
- [ ] Add bulk operations (delete, move)
- [ ] Implement task duplication
- [ ] Add import/export tasks (JSON)

### **Week 9-10: Statistics**
- [ ] Calculate daily focus time
- [ ] Track completed tasks
- [ ] Implement streak calculation
- [ ] Create bar chart component
- [ ] Add pie chart for categories
- [ ] Implement calendar heatmap
- [ ] Create statistics screen layout
- [ ] Add date range selector
- [ ] Implement data aggregation
- [ ] Cache statistics for performance

### **Week 11-12: Visual Timer Styles**
- [ ] Design analog clock timer
- [ ] Implement circular progress ring
- [ ] Create linear progress bar
- [ ] Build flip clock animation
- [ ] Design pixel hourglass (frame by frame)
- [ ] Create Pac-Man eating animation
- [ ] Implement Space Invaders countdown
- [ ] Build Tetris block stacking
- [ ] Add style selector in settings
- [ ] Optimize animations for performance

### **Week 13-14: Audio System**
- [ ] Implement MediaPlayer wrapper
- [ ] Add built-in alert sounds
- [ ] Create sound selection UI
- [ ] Implement white noise generator
- [ ] Add pink noise generator
- [ ] Create audio mixer
- [ ] Add volume controls
- [ ] Handle audio focus (calls, music)
- [ ] Implement background audio service
- [ ] Test audio on different devices

### **Week 15-16: Eisenhower Matrix**
- [ ] Create 4-quadrant layout
- [ ] Implement drag-drop between quadrants
- [ ] Add task priority assignment
- [ ] Create quadrant color coding
- [ ] Implement filter by quadrant
- [ ] Add "Start from quadrant" action
- [ ] Create quadrant statistics
- [ ] Add auto-suggestion based on keywords
- [ ] Implement quick quadrant reassignment

### **Week 17-18: Complex Rotation**
- [ ] Design rotation pattern data structure
- [ ] Create rotation editor UI
- [ ] Implement inner loop logic
- [ ] Add sequential task chains
- [ ] Create rotation templates
- [ ] Implement pattern saving/loading
- [ ] Build visual rotation preview
- [ ] Add pattern validation
- [ ] Test complex rotation scenarios

### **Week 19-20: Brain Dump**
- [ ] Create quick capture floating button
- [ ] Implement voice-to-text input
- [ ] Design inbox screen
- [ ] Add inbox processing workflow
- [ ] Implement snooze functionality
- [ ] Create task creation from inbox
- [ ] Add batch inbox operations
- [ ] Implement inbox notifications

### **Week 21-22: Gamification**
- [ ] Design achievement system
- [ ] Create achievement database schema
- [ ] Implement XP and level calculation
- [ ] Build achievement unlock logic
- [ ] Create achievement notification
- [ ] Design medals/badges UI
- [ ] Implement daily challenges
- [ ] Add streak bonus rewards
- [ ] Create achievement screen

### **Week 23-24: ML - Data Collection**
- [ ] Implement session logging
- [ ] Track all user interactions
- [ ] Log task completions with metadata
- [ ] Record pause/skip events
- [ ] Capture time-of-day data
- [ ] Store focus quality ratings
- [ ] Log energy level inputs
- [ ] Collect 2 weeks of personal data

### **Week 25-26: ML - LSTM Training**
- [ ] Export training data to CSV
- [ ] Preprocess data (normalization)
- [ ] Split train/validation sets
- [ ] Build LSTM architecture
- [ ] Train model (50 epochs)
- [ ] Evaluate on validation set
- [ ] Convert to TFLite
- [ ] Integrate TFLite in app
- [ ] Test predictions vs actuals

### **Week 27-28: ML - Task Recommender**
- [ ] Implement DQN state space
- [ ] Define reward function
- [ ] Create experience replay buffer
- [ ] Build DQN architecture
- [ ] Train on historical data
- [ ] Implement epsilon-greedy exploration
- [ ] Convert to TFLite
- [ ] Integrate recommendation engine
- [ ] Add explainability (why this task?)

### **Week 29-30: Personal Data Training**
- [ ] Export WhatsApp chat as .txt
- [ ] Parse WhatsApp format
- [ ] Extract task mentions
- [ ] Import diary entries
- [ ] Create training dataset (JSONL)
- [ ] Fine-tune Gemma 2B (QLoRA)
- [ ] Evaluate model responses
- [ ] Convert to TFLite
- [ ] Deploy in app

### **Week 31-32: Conversational AI**
- [ ] Create chat interface UI
- [ ] Implement prompt engineering
- [ ] Add context injection
- [ ] Create response streaming
- [ ] Add typing indicator
- [ ] Implement chat history
- [ ] Add "Ask AI" button on home
- [ ] Test natural language queries

### **Week 33-34: Logic Canvas**
- [ ] Implement infinite canvas
- [ ] Create node components
- [ ] Add drag-drop nodes
- [ ] Implement connection drawing
- [ ] Add zoom/pan controls
- [ ] Create node editing
- [ ] Implement logic evaluation engine
- [ ] Add canvas save/load
- [ ] Test complex logic flows

### **Week 35-36: Floating Overlay**
- [ ] Request overlay permission
- [ ] Implement WindowManager overlay
- [ ] Create floating timer UI
- [ ] Add drag gesture handling
- [ ] Implement minimize/expand
- [ ] Add click-through mode
- [ ] Create custom size controls
- [ ] Test on different Android versions

### **Week 37-38: AOD Integration**
- [ ] Implement DreamService
- [ ] Design AOD layout
- [ ] Add OLED optimization
- [ ] Implement low-power rendering
- [ ] Add countdown display
- [ ] Test battery drain
- [ ] Handle device lock/unlock

### **Week 39-40: Screen Flash**
- [ ] Create full-screen overlay
- [ ] Implement color pulse animation
- [ ] Add customization options
- [ ] Control flash duration
- [ ] Add fade effects
- [ ] Test on OLED/LCD screens

### **Week 41-42: Polish & Testing**
- [ ] Fix all critical bugs
- [ ] Optimize performance
- [ ] Add animations polish
- [ ] Test on 5+ devices
- [ ] Test on Android 10, 11, 12, 13, 14
- [ ] Handle edge cases
- [ ] Add error handling
- [ ] Implement crash reporting

### **Week 43-44: Documentation & Release**
- [ ] Write user guide
- [ ] Create video tutorial
- [ ] Design app store screenshots
- [ ] Write app description
- [ ] Create privacy policy
- [ ] Set up Google Play Console
- [ ] Upload APK
- [ ] Submit for review

***

## **Post-Launch**

### **Maintenance:**
- [ ] Monitor crash reports
- [ ] Fix reported bugs
- [ ] Respond to user reviews
- [ ] Gather feature requests
- [ ] Update ML models monthly
- [ ] Release patch updates

### **Future Features:**
- [ ] Add cloud sync (Firebase)
- [ ] Implement backup/restore
- [ ] Create web version
- [ ] Build iOS version
- [ ] Add team collaboration
- [ ] Integrate with calendar apps
- [ ] Add Wear OS support
- [ ] Create widget

***

# 🎨 **VISUAL STYLE SPECIFICATIONS**

## **Pixel Art Timers (Detailed)**

### **1. Hourglass Timer (Tomato Style)**[1]

**Design:**
```
Frame 1 (Start):
    ░░░▓▓▓░░░    ← Green leaves (top)
   ░░▓▓▓▓▓░░
  ░▓▓▓▓▓▓▓░
  ▒▒▒▒▒▒▒▒▒    ← Sand (full top)
  ▒▒▒▒▒▒▒▒▒
   ▒▒▒▒▒▒▒
    ▒▒▒▒▒
     ░░░       ← Narrow neck
    ░░░░░
   ░░░░░░░     ← Empty bottom
  ░░░░░░░░░
  ███████████   ← Red tomato body

Frame N (Mid):
    ░░░▓▓▓░░░
   ░░▓▓▓▓▓░░
  ░▓▓▓▓▓▓▓░
  ░░░░▒▒▒░░░   ← Less sand on top
   ░░░░░░░
    ▒▒▒▒▒      ← Sand falling
     ░▒░
    ░▒▒▒░
   ▒▒▒▒▒▒▒     ← More sand in bottom
  ▒▒▒▒▒▒▒▒▒
  ███████████

Frame Last (End):
    ░░░▓▓▓░░░
   ░░▓▓▓▓▓░░
  ░▓▓▓▓▓▓▓░
  ░░░░░░░░░    ← Empty top
   ░░░░░░░
     ░░░
    ░░░░░
   ▒▒▒▒▒▒▒
  ▒▒▒▒▒▒▒▒▒    ← Full bottom
  ███████████
```

**Animation Logic:**
- Total frames: 60 (one per second for 1 minute)
- Each second: 1-2 pixels "fall" from top to bottom
- Blinking pixel: Flash white for 100ms each second
- Minute glow: Entire border pulses yellow for 500ms
- Color scheme: 
  - Leaves: #228B22 (Forest Green)
  - Sand: #F4A460 (Sandy Brown)
  - Tomato: #DC143C (Crimson)
  - Blink: #FFFFFF (White)

**Implementation:**
```kotlin
class PixelHourglassTimer(
    private val totalSeconds: Int
) {
    private var currentFrame = 0
    private val totalFrames = 60
    
    fun drawFrame(canvas: Canvas, secondsRemaining: Int) {
        val progress = 1f - (secondsRemaining.toFloat() / totalSeconds)
        
        // Draw top bulb (decreasing sand)
        val topSandPixels = (100 * (1 - progress)).toInt()
        drawTopSand(canvas, topSandPixels)
        
        // Draw falling pixels
        drawFallingParticles(canvas, progress)
        
        // Draw bottom bulb (increasing sand)
        val bottomSandPixels = (100 * progress).toInt()
        drawBottomSand(canvas, bottomSandPixels)
        
        // Blink effect every second
        if (secondsRemaining % 1 == 0) {
            drawBlinkPixel(canvas)
        }
        
        // Glow on minute completion
        if (secondsRemaining % 60 == 0 && secondsRemaining > 0) {
            drawGlowEffect(canvas)
        }
    }
}
```

***

### **2. Pac-Man Timer**

**Design:**
```
Start:
⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪ (10 dots = 10 minutes)
      🔵 ◀ PAC-MAN

Minute 5:
⚪⚪⚪⚪⚪⚫⚫⚫⚫⚫ (5 dots eaten)
            🔵 ◀

End:
⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫ (all eaten)
                  🔵 ◀
```

**Animation:**
- Pac-Man mouth opens/closes (3 frames, 200ms each)
- Moves right at constant speed
- Eats one dot per minute
- Dot disappears with "waka" sound
- Ghost appears at 50% (chases Pac-Man)
- Power pellet at 75% (Pac-Man turns blue, eats ghost)

**Colors:**
- Pac-Man: #FFFF00 (Yellow)
- Dots: #FFB8FF (Light Pink)
- Ghost: #FF0000 (Red) or #00FFFF (Cyan when scared)
- Background: #000000 (Black)

***

### **3. Space Invaders Timer**

**Design:**
```
Start (25 minutes):
👾 👾 👾 👾 👾
 👾 👾 👾 👾
  👾 👾 👾
   👾 👾
    👾

Every minute: Laser shoots up, one alien explodes

End (0 minutes):
💥 💥 💥 💥 💥 (explosion pixels)

🚀 ═══════════ (victory)
```

**Animation:**
- Aliens move left-right (classic Space Invaders pattern)
- Speed increases as time runs low (urgency!)
- Laser charge animation (1 sec)
- Alien explosion (particle effect)
- Each alien = 1 minute
- Final alien plays dramatic explosion

***

### **4. Tetris Timer**

**Design:**
```
Empty (start):
┌──────────┐
│          │
│          │
│          │
│          │
│          │
│          │
│          │
└──────────┘

After 10 minutes:
┌──────────┐
│          │
│          │
│    ▓▓    │ ← New piece
│    ▓▓    │
│  ▓▓▓▓    │
│▓▓▓▓▓▓▓▓  │
│▓▓▓▓▓▓▓▓  │
└──────────┘

End (full):
┌──────────┐
│▓▓▓▓▓▓▓▓▓▓│ ← Complete
│▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓│
└──────────┘
```

**Animation:**
- Random tetromino falls from top (per minute)
- Piece rotates and lands
- Classic Tetris physics
- Line clears if complete (flash effect)
- Different colors per piece type
- Game Over screen when full

***

### **5. Candle Timer**

**Design:**
```
Start:
  🔥 ← Flickering flame
  ▓▓
  ▓▓
  ▓▓ ← Candle wax
  ▓▓
  ▓▓
  ▓▓
  ██ ← Base

Mid:
  🔥
  ▓▓
  ░░ ← Melted
  ░░
  ░░
  ░░
  ░░
  ██

End:
  💨 ← Smoke
  ░░
  ░░ ← Burnt
  ░░
  ██
```

**Animation:**
- Flame flickers randomly (5 frame loop)
- Wax drips occasionally (particle effect)
- Candle shrinks pixel by pixel
- Smoke rises when complete
- Glow effect around flame

***

## **Color Palette**

### **Dark Theme (Primary):**
```
Background: #0F172A (Slate 900)
Surface: #1E293B (Slate 800)
Primary: #3B82F6 (Blue 500)
Secondary: #8B5CF6 (Purple 500)
Accent: #10B981 (Emerald 500)
Error: #EF4444 (Red 500)
Text: #F1F5F9 (Slate 100)
Text Secondary: #94A3B8 (Slate 400)
```

### **Light Theme (Alternative):**
```
Background: #FFFFFF (White)
Surface: #F1F5F9 (Slate 100)
Primary: #2563EB (Blue 600)
Secondary: #7C3AED (Purple 600)
Accent: #059669 (Emerald 600)
Error: #DC2626 (Red 600)
Text: #0F172A (Slate 900)
Text Secondary: #64748B (Slate 500)
```

### **Focus Quality Colors:**
```
Excellent (90-100%): #10B981 (Green)
Good (75-89%): #3B82F6 (Blue)
Fair (60-74%): #F59E0B (Amber)
Poor (< 60%): #EF4444 (Red)
```

### **Priority Colors (Eisenhower):**
```
Urgent & Important: #DC2626 (Red)
Important & Not Urgent: #F59E0B (Amber)
Urgent & Not Important: #3B82F6 (Blue)
Not Important & Not Urgent: #6B7280 (Gray)
```

***

# 🗂️ **FILE STRUCTURE (Complete)**

```
FloatingTimerApp/
│
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/yourname/focustimer/
│   │   │   │   ├── FocusTimerApplication.kt
│   │   │   │   │
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   ├── theme/
│   │   │   │   │   │   ├── Color.kt
│   │   │   │   │   │   ├── Theme.kt
│   │   │   │   │   │   ├── Type.kt
│   │   │   │   │   │   └── Shape.kt
│   │   │   │   │   ├── screens/
│   │   │   │   │   │   ├── home/
│   │   │   │   │   │   │   ├── HomeScreen.kt
│   │   │   │   │   │   │   ├── HomeViewModel.kt
│   │   │   │   │   │   │   └── HomeState.kt
│   │   │   │   │   │   ├── timer/
│   │   │   │   │   │   │   ├── TimerScreen.kt
│   │   │   │   │   │   │   ├── TimerViewModel.kt
│   │   │   │   │   │   │   └── TimerState.kt
│   │   │   │   │   │   ├── tasks/
│   │   │   │   │   │   │   ├── TaskListScreen.kt
│   │   │   │   │   │   │   ├── TaskEditScreen.kt
│   │   │   │   │   │   │   ├── TaskViewModel.kt
│   │   │   │   │   │   │   └── TaskState.kt
│   │   │   │   │   │   ├── folders/
│   │   │   │   │   │   │   ├── FolderScreen.kt
│   │   │   │   │   │   │   ├── FolderViewModel.kt
│   │   │   │   │   │   │   └── FolderState.kt
│   │   │   │   │   │   ├── canvas/
│   │   │   │   │   │   │   ├── CanvasEditorScreen.kt
│   │   │   │   │   │   │   ├── CanvasViewModel.kt
│   │   │   │   │   │   │   └── CanvasState.kt
│   │   │   │   │   │   ├── matrix/
│   │   │   │   │   │   │   ├── EisenhowerMatrixScreen.kt
│   │   │   │   │   │   │   ├── MatrixViewModel.kt
│   │   │   │   │   │   │   └── MatrixState.kt
│   │   │   │   │   │   ├── statistics/
│   │   │   │   │   │   │   ├── StatisticsScreen.kt
│   │   │   │   │   │   │   ├── StatsViewModel.kt
│   │   │   │   │   │   │   └── StatsState.kt
│   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   │   ├── SettingsScreen.kt
│   │   │   │   │   │   │   ├── SettingsViewModel.kt
│   │   │   │   │   │   │   └── SettingsState.kt
│   │   │   │   │   │   └── onboarding/
│   │   │   │   │   │       ├── OnboardingScreen.kt
│   │   │   │   │   │       └── OnboardingViewModel.kt
│   │   │   │   │   │
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── timer/
│   │   │   │   │   │   │   ├── FloatingTimer.kt
│   │   │   │   │   │   │   ├── PixelHourglassTimer.kt
│   │   │   │   │   │   │   ├── PixelArtRenderer.kt
│   │   │   │   │   │   │   ├── SpaceInvaderTimer.kt
│   │   │   │   │   │   │   ├── PacManTimer.kt
│   │   │   │   │   │   │   ├── TetrisTimer.kt
│   │   │   │   │   │   │   ├── CandleTimer.kt
│   │   │   │   │   │   │   ├── AnalogClockTimer.kt
│   │   │   │   │   │   │   ├── DigitalClockTimer.kt
│   │   │   │   │   │   │   └── ProgressRingTimer.kt
│   │   │   │   │   │   ├── tasks/
│   │   │   │   │   │   │   ├── TaskCard.kt
│   │   │   │   │   │   │   ├── TaskListItem.kt
│   │   │   │   │   │   │   ├── CompactTaskItem.kt
│   │   │   │   │   │   │   ├── TaskEditDialog.kt
│   │   │   │   │   │   │   └── QuickCaptureDialog.kt
│   │   │   │   │   │   ├── folders/
│   │   │   │   │   │   │   ├── FolderCard.kt
│   │   │   │   │   │   │   ├── FolderSelector.kt
│   │   │   │   │   │   │   └── FolderTree.kt
│   │   │   │   │   │   ├── canvas/
│   │   │   │   │   │   │   ├── InfiniteCanvas.kt
│   │   │   │   │   │   │   ├── TaskNode.kt
│   │   │   │   │   │   │   ├── DecisionNode.kt
│   │   │   │   │   │   │   ├── LoopNode.kt
│   │   │   │   │   │   │   ├── TimeGateNode.kt
│   │   │   │   │   │   │   ├── AndGateNode.kt
│   │   │   │   │   │   │   ├── OrGateNode.kt
│   │   │   │   │   │   │   ├── ConnectionLine.kt
│   │   │   │   │   │   │   └── NodeToolbar.kt
│   │   │   │   │   │   ├── statistics/
│   │   │   │   │   │   │   ├── BarChart.kt
│   │   │   │   │   │   │   ├── PieChart.kt
│   │   │   │   │   │   │   ├── LineGraph.kt
│   │   │   │   │   │   │   ├── CalendarHeatmap.kt
│   │   │   │   │   │   │   └── StatsCard.kt
│   │   │   │   │   │   └── common/
│   │   │   │   │   │       ├── ColorPicker.kt
│   │   │   │   │   │       ├── IconPicker.kt
│   │   │   │   │   │       ├── DateTimePicker.kt
│   │   │   │   │   │       ├── DurationPicker.kt
│   │   │   │   │   │       ├── ConfirmDialog.kt
│   │   │   │   │   │       └── LoadingOverlay.kt
│   │   │   │   │   │
│   │   │   │   │   └── navigation/
│   │   │   │   │       ├── Navigation.kt
│   │   │   │   │       ├── Screen.kt
│   │   │   │   │       └── NavigationDrawer.kt
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── Task.kt
│   │   │   │   │   │   ├── TaskFolder.kt
│   │   │   │   │   │   ├── FocusSession.kt
│   │   │   │   │   │   ├── RotationPattern.kt
│   │   │   │   │   │   ├── LogicNode.kt
│   │   │   │   │   │   ├── NodeConnection.kt
│   │   │   │   │   │   ├── Achievement.kt
│   │   │   │   │   │   ├── DailyStatistics.kt
│   │   │   │   │   │   ├── TimerStyle.kt
│   │   │   │   │   │   └── UserPreferences.kt
│   │   │   │   │   │
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── TaskRepository.kt
│   │   │   │   │   │   ├── SessionRepository.kt
│   │   │   │   │   │   ├── StatisticsRepository.kt
│   │   │   │   │   │   ├── PreferencesRepository.kt
│   │   │   │   │   │   └── MLRepository.kt
│   │   │   │   │   │
│   │   │   │   │   └── usecase/
│   │   │   │   │       ├── task/
│   │   │   │   │       │   ├── CreateTaskUseCase.kt
│   │   │   │   │       │   ├── UpdateTaskUseCase.kt
│   │   │   │   │       │   ├── DeleteTaskUseCase.kt
│   │   │   │   │       │   ├── GetTasksUseCase.kt
│   │   │   │   │       │   ├── GetTaskByIdUseCase.kt
│   │   │   │   │       │   └── SearchTasksUseCase.kt
│   │   │   │   │       ├── timer/
│   │   │   │   │       │   ├── StartTimerUseCase.kt
│   │   │   │   │       │   ├── PauseTimerUseCase.kt
│   │   │   │   │       │   ├── ResumeTimerUseCase.kt
│   │   │   │   │       │   ├── StopTimerUseCase.kt
│   │   │   │   │       │   ├── SkipTaskUseCase.kt
│   │   │   │   │       │   └── CompleteTaskUseCase.kt
│   │   │   │   │       ├── rotation/
│   │   │   │   │       │   ├── CreateRotationUseCase.kt
│   │   │   │   │       │   ├── ExecuteRotationUseCase.kt
│   │   │   │   │       │   └── EvaluateLogicCanvasUseCase.kt
│   │   │   │   │       ├── ml/
│   │   │   │   │       │   ├── PredictDurationUseCase.kt
│   │   │   │   │       │   ├── RecommendNextTaskUseCase.kt
│   │   │   │   │       │   ├── DetectFocusQualityUseCase.kt
│   │   │   │   │       │   └── TrainModelUseCase.kt
│   │   │   │   │       └── statistics/
│   │   │   │   │           ├── CalculateDailyStatsUseCase.kt
│   │   │   │   │           ├── GetStreakUseCase.kt
│   │   │   │   │           ├── GetFocusTimeUseCase.kt
│   │   │   │   │           └── ExportStatisticsUseCase.kt
│   │   │   │   │
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/
│   │   │   │   │   │   ├── database/
│   │   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   │   ├── DatabaseCallback.kt
│   │   │   │   │   │   │   ├── dao/
│   │   │   │   │   │   │   │   ├── TaskDao.kt
│   │   │   │   │   │   │   │   ├── FolderDao.kt
│   │   │   │   │   │   │   │   ├── SessionDao.kt
│   │   │   │   │   │   │   │   ├── StatisticsDao.kt
│   │   │   │   │   │   │   │   ├── RotationDao.kt
│   │   │   │   │   │   │   │   ├── CanvasDao.kt
│   │   │   │   │   │   │   │   └── AchievementDao.kt
│   │   │   │   │   │   │   ├── entity/
│   │   │   │   │   │   │   │   ├── TaskEntity.kt
│   │   │   │   │   │   │   │   ├── FolderEntity.kt
│   │   │   │   │   │   │   │   ├── SessionEntity.kt
│   │   │   │   │   │   │   │   ├── StatisticsEntity.kt
│   │   │   │   │   │   │   │   ├── RotationEntity.kt
│   │   │   │   │   │   │   │   ├── LogicNodeEntity.kt
│   │   │   │   │   │   │   │   ├── NodeConnectionEntity.kt
│   │   │   │   │   │   │   │   └── AchievementEntity.kt
│   │   │   │   │   │   │   └── migration/
│   │   │   │   │   │   │       ├── Migration_1_2.kt
│   │   │   │   │   │   │       ├── Migration_2_3.kt
│   │   │   │   │   │   │       └── AutoMigrations.kt
│   │   │   │   │   │   ├── datastore/
│   │   │   │   │   │   │   ├── PreferencesManager.kt
│   │   │   │   │   │   │   └── UserPreferences.kt
│   │   │   │   │   │   └── files/
│   │   │   │   │   │       ├── ModelFileManager.kt
│   │   │   │   │   │       └── ExportManager.kt
│   │   │   │   │   │
│   │   │   │   │   ├── mapper/
│   │   │   │   │   │   ├── TaskMapper.kt
│   │   │   │   │   │   ├── SessionMapper.kt
│   │   │   │   │   │   └── StatisticsMapper.kt
│   │   │   │   │   │
│   │   │   │   │   └── repository/
│   │   │   │   │       ├── TaskRepositoryImpl.kt
│   │   │   │   │       ├── SessionRepositoryImpl.kt
│   │   │   │   │       ├── StatisticsRepositoryImpl.kt
│   │   │   │   │       ├── PreferencesRepositoryImpl.kt
│   │   │   │   │       └── MLRepositoryImpl.kt
│   │   │   │   │
│   │   │   │   ├── ml/
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── TaskDurationPredictor.kt
│   │   │   │   │   │   ├── NextTaskRecommender.kt
│   │   │   │   │   │   ├── GemmaScheduler.kt
│   │   │   │   │   │   ├── AttentionDetector.kt
│   │   │   │   │   │   └── ModelConfig.kt
│   │   │   │   │   ├── training/
│   │   │   │   │   │   ├── DataCollector.kt
│   │   │   │   │   │   ├── DataPreprocessor.kt
│   │   │   │   │   │   ├── ModelTrainer.kt
│   │   │   │   │   │   ├── ModelEvaluator.kt
│   │   │   │   │   │   └── TrainingConfig.kt
│   │   │   │   │   ├── inference/
│   │   │   │   │   │   ├── TFLiteInterpreter.kt
│   │   │   │   │   │   ├── ModelLoader.kt
│   │   │   │   │   │   ├── InferenceEngine.kt
│   │   │   │   │   │   └── FeatureExtractor.kt
│   │   │   │   │   └── personal/
│   │   │   │   │       ├── WhatsAppParser.kt
│   │   │   │   │       ├── DiaryParser.kt
│   │   │   │   │       ├── TrainingDataCreator.kt
│   │   │   │   │       └── PersonalModelFinetuner.kt
│   │   │   │   │
│   │   │   │   ├── audio/
│   │   │   │   │   ├── AudioManager.kt
│   │   │   │   │   ├── SoundPlayer.kt
│   │   │   │   │   ├── WhiteNoiseGenerator.kt
│   │   │   │   │   ├── PinkNoiseGenerator.kt
│   │   │   │   │   ├── BrownNoiseGenerator.kt
│   │   │   │   │   ├── AudioMixer.kt
│   │   │   │   │   ├── AudioFocusManager.kt
│   │   │   │   │   └── SoundLibrary.kt
│   │   │   │   │
│   │   │   │   ├── service/
│   │   │   │   │   ├── TimerService.kt
│   │   │   │   │   ├── FloatingOverlayService.kt
│   │   │   │   │   ├── AODService.kt
│   │   │   │   │   ├── NotificationService.kt
│   │   │   │   │   ├── BackgroundSyncService.kt
│   │   │   │   │   └── MLTrainingService.kt
│   │   │   │   │
│   │   │   │   ├── util/
│   │   │   │   │   ├── TimeFormatter.kt
│   │   │   │   │   ├── ColorUtils.kt
│   │   │   │   │   ├── NotificationHelper.kt
│   │   │   │   │   ├── PermissionHelper.kt
│   │   │   │   │   ├── FileUtils.kt
│   │   │   │   │   ├── DateUtils.kt
│   │   │   │   │   ├── ValidationUtils.kt
│   │   │   │   │   └── Extensions.kt
│   │   │   │   │
│   │   │   │   └── di/
│   │   │   │       ├── AppModule.kt
│   │   │   │       ├── DatabaseModule.kt
│   │   │   │       ├── RepositoryModule.kt
│   │   │   │       ├── UseCaseModule.kt
│   │   │   │       ├── ViewModelModule.kt
│   │   │   │       ├── MLModule.kt
│   │   │   │       └── ServiceModule.kt
│   │   │   │
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   │   ├── ic_timer.xml
│   │   │   │   │   ├── ic_tasks.xml
│   │   │   │   │   ├── ic_statistics.xml
│   │   │   │   │   ├── ic_settings.xml
│   │   │   │   │   ├── pixel_hourglass_frame_
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   │   ├── ic_timer.xml
│   │   │   │   │   ├── ic_tasks.xml
│   │   │   │   │   ├── ic_statistics.xml
│   │   │   │   │   ├── ic_settings.xml
│   │   │   │   │   ├── ic_folder.xml
│   │   │   │   │   ├── ic_canvas.xml
│   │   │   │   │   ├── ic_matrix.xml
│   │   │   │   │   ├── ic_brain.xml
│   │   │   │   │   ├── ic_play.xml
│   │   │   │   │   ├── ic_pause.xml
│   │   │   │   │   ├── ic_stop.xml
│   │   │   │   │   ├── ic_skip.xml
│   │   │   │   │   ├── ic_add.xml
│   │   │   │   │   ├── ic_edit.xml
│   │   │   │   │   ├── ic_delete.xml
│   │   │   │   │   ├── ic_notification.xml
│   │   │   │   │   ├── ic_sound_on.xml
│   │   │   │   │   ├── ic_sound_off.xml
│   │   │   │   │   ├── ic_vibrate.xml
│   │   │   │   │   ├── ic_achievement.xml
│   │   │   │   │   ├── ic_medal_bronze.xml
│   │   │   │   │   ├── ic_medal_silver.xml
│   │   │   │   │   ├── ic_medal_gold.xml
│   │   │   │   │   ├── pixel_hourglass_frame_00.png
│   │   │   │   │   ├── pixel_hourglass_frame_01.png
│   │   │   │   │   ├── ... (60 frames total)
│   │   │   │   │   ├── pixel_pacman_frame_00.png
│   │   │   │   │   ├── pixel_pacman_frame_01.png
│   │   │   │   │   ├── pixel_pacman_frame_02.png
│   │   │   │   │   ├── pixel_spaceinvader_00.png
│   │   │   │   │   ├── ... (alien sprites)
│   │   │   │   │   ├── pixel_tetris_pieces.png
│   │   │   │   │   ├── pixel_candle_flame.png
│   │   │   │   │   ├── bg_card.xml
│   │   │   │   │   ├── bg_button.xml
│   │   │   │   │   ├── bg_timer.xml
│   │   │   │   │   └── splash_screen.xml
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── activity_main.xml
│   │   │   │   │   ├── floating_timer_layout.xml
│   │   │   │   │   ├── aod_layout.xml
│   │   │   │   │   └── notification_layout.xml
│   │   │   │   │
│   │   │   │   ├── raw/
│   │   │   │   │   ├── alert_bell.mp3
│   │   │   │   │   ├── alert_chime.mp3
│   │   │   │   │   ├── alert_ding.mp3
│   │   │   │   │   ├── alert_gong.mp3
│   │   │   │   │   ├── alert_sweep.mp3
│   │   │   │   │   ├── pacman_waka.mp3
│   │   │   │   │   ├── spaceinvader_shoot.mp3
│   │   │   │   │   ├── tetris_clear.mp3
│   │   │   │   │   ├── achievement_unlock.mp3
│   │   │   │   │   └── completion_fanfare.mp3
│   │   │   │   │
│   │   │   │   ├── values/
│   │   │   │   │   ├── colors.xml
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   ├── themes.xml
│   │   │   │   │   ├── dimens.xml
│   │   │   │   │   ├── styles.xml
│   │   │   │   │   └── arrays.xml
│   │   │   │   │
│   │   │   │   ├── xml/
│   │   │   │   │   ├── backup_rules.xml
│   │   │   │   │   └── data_extraction_rules.xml
│   │   │   │   │
│   │   │   │   └── AndroidManifest.xml
│   │   │   │
│   │   │   └── assets/
│   │   │       ├── models/
│   │   │       │   ├── task_duration_predictor.tflite
│   │   │       │   ├── next_task_recommender.tflite
│   │   │       │   ├── gemma_2b_int4.tflite
│   │   │       │   ├── attention_detector.tflite
│   │   │       │   └── model_metadata.json
│   │   │       │
│   │   │       ├── fonts/
│   │   │       │   ├── roboto_regular.ttf
│   │   │       │   ├── roboto_bold.ttf
│   │   │       │   ├── jetbrains_mono.ttf (for timer)
│   │   │       │   └── pixel_font.ttf
│   │   │       │
│   │   │       └── templates/
│   │   │           ├── study_routine.json
│   │   │           ├── work_routine.json
│   │   │           ├── project_sprint.json
│   │   │           └── exam_prep.json
│   │   │
│   │   ├── test/ (Unit Tests)
│   │   │   └── java/com/yourname/focustimer/
│   │   │       ├── domain/usecase/
│   │   │       │   ├── CreateTaskUseCaseTest.kt
│   │   │       │   ├── StartTimerUseCaseTest.kt
│   │   │       │   └── CalculateStatisticsUseCaseTest.kt
│   │   │       ├── data/repository/
│   │   │       │   ├── TaskRepositoryTest.kt
│   │   │       │   └── SessionRepositoryTest.kt
│   │   │       ├── util/
│   │   │       │   ├── TimeFormatterTest.kt
│   │   │       │   └── ValidationUtilsTest.kt
│   │   │       └── ml/
│   │   │           ├── TaskDurationPredictorTest.kt
│   │   │           └── FeatureExtractorTest.kt
│   │   │
│   │   └── androidTest/ (Instrumentation Tests)
│   │       └── java/com/yourname/focustimer/
│   │           ├── database/
│   │           │   ├── TaskDaoTest.kt
│   │           │   ├── SessionDaoTest.kt
│   │           │   └── MigrationTest.kt
│   │           ├── ui/
│   │           │   ├── HomeScreenTest.kt
│   │           │   ├── TimerScreenTest.kt
│   │           │   └── TaskEditScreenTest.kt
│   │           └── service/
│   │               ├── TimerServiceTest.kt
│   │               └── FloatingOverlayServiceTest.kt
│   │
│   ├── build.gradle.kts (App module)
│   └── proguard-rules.pro
│
├── ml/ (ML Training Scripts - Python)
│   ├── notebooks/
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_lstm_training.ipynb
│   │   ├── 03_dqn_training.ipynb
│   │   ├── 04_gemma_finetuning.ipynb
│   │   └── 05_model_evaluation.ipynb
│   │
│   ├── scripts/
│   │   ├── data_preprocessing.py
│   │   ├── train_lstm.py
│   │   ├── train_dqn.py
│   │   ├── finetune_gemma.py
│   │   ├── convert_to_tflite.py
│   │   ├── evaluate_model.py
│   │   └── export_model.py
│   │
│   ├── data/
│   │   ├── raw/
│   │   │   ├── whatsapp_chat.txt
│   │   │   ├── diary_entries.txt
│   │   │   └── task_logs.csv
│   │   ├── processed/
│   │   │   ├── training_data.csv
│   │   │   ├── validation_data.csv
│   │   │   └── test_data.csv
│   │   └── models/
│   │       ├── lstm_checkpoint/
│   │       ├── dqn_checkpoint/
│   │       └── gemma_lora/
│   │
│   ├── utils/
│   │   ├── whatsapp_parser.py
│   │   ├── diary_parser.py
│   │   ├── feature_engineering.py
│   │   └── data_augmentation.py
│   │
│   ├── models/
│   │   ├── lstm_model.py
│   │   ├── dqn_agent.py
│   │   ├── attention_model.py
│   │   └── reward_function.py
│   │
│   ├── requirements.txt
│   ├── README.md
│   └── config.yaml
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── ML_MODELS.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPMENT_SETUP.md
│   ├── TESTING_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── design/
│   ├── mockups/
│   │   ├── home_screen.png
│   │   ├── timer_screen.png
│   │   ├── task_list.png
│   │   ├── statistics.png
│   │   ├── eisenhower_matrix.png
│   │   └── canvas_editor.png
│   │
│   ├── assets/
│   │   ├── logo.svg
│   │   ├── icon_512.png
│   │   ├── icon_192.png
│   │   ├── feature_graphic.png
│   │   └── screenshots/
│   │       ├── screenshot_1.png
│   │       ├── screenshot_2.png
│   │       ├── ... (8 screenshots total)
│   │
│   └── pixel_art/
│       ├── hourglass_source.psd
│       ├── pacman_source.psd
│       ├── spaceinvader_source.psd
│       └── tetris_source.psd
│
├── scripts/
│   ├── generate_icons.sh
│   ├── export_pixel_frames.sh
│   ├── setup_environment.sh
│   ├── run_tests.sh
│   ├── build_release.sh
│   └── deploy_to_play_store.sh
│
├── .github/
│   └── workflows/
│       ├── android_build.yml
│       ├── run_tests.yml
│       ├── lint_check.yml
│       └── release.yml
│
├── build.gradle.kts (Project level)
├── settings.gradle.kts
├── gradle.properties
├── local.properties
├── .gitignore
├── README.md
├── LICENSE
└── CHANGELOG.md
```

***

# 📦 **KEY CONFIGURATION FILES**

## **build.gradle.kts (App Module)**

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp") version "1.9.20-1.0.14"
    id("com.google.dagger.hilt.android")
    id("kotlin-parcelize")
}

android {
    namespace = "com.yourname.focustimer"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yourname.focustimer"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // ML model configuration
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            isMinifyEnabled = false
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=androidx.compose.foundation.ExperimentalFoundationApi"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.2.0")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // TensorFlow Lite
    implementation("org.tensorflow:tensorflow-lite:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-gpu:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-support:0.4.4")
    implementation("org.tensorflow:tensorflow-lite-metadata:0.4.4")
    implementation("org.tensorflow:tensorflow-lite-task-text:0.4.4")

    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48.1")
    ksp("com.google.dagger:hilt-compiler:2.48.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    implementation("androidx.hilt:hilt-work:1.1.0")
    ksp("androidx.hilt:hilt-compiler:1.1.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    // JSON
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    implementation("com.google.code.gson:gson:2.10.1")

    // Charts & Visualization
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")
    implementation("com.patrykandpatrick.vico:compose:1.13.1")
    implementation("com.patrykandpatrick.vico:compose-m3:1.13.1")

    // Permissions
    implementation("com.google.accompanist:accompanist-permissions:0.32.0")

    // Coil (Image Loading)
    implementation("io.coil-kt:coil-compose:2.5.0")

    // Lottie Animations
    implementation("com.airbnb.android:lottie-compose:6.2.0")

    // Audio Processing
    implementation("com.arthenica:ffmpeg-kit-audio:6.0-2")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("androidx.room:room-testing:2.6.1")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("com.google.truth:truth:1.1.5")

    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("androidx.navigation:navigation-testing:2.7.6")
    androidTestImplementation("androidx.work:work-testing:2.9.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

***

## **AndroidManifest.xml**

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="29"
        tools:ignore="ScopedStorage" />
    
    <!-- Features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />

    <application
        android:name=".FocusTimerApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FocusTimer"
        android:largeHeap="true"
        tools:targetApi="31">

        <!-- Main Activity -->
        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.FocusTimer"
            android:screenOrientation="portrait"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Timer Foreground Service -->
        <service
            android:name=".service.TimerService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="productivity_timer" />
        </service>

        <!-- Floating Overlay Service -->
        <service
            android:name=".service.FloatingOverlayService"
            android:enabled="true"
            android:exported="false" />

        <!-- Always-On Display Service -->
        <service
            android:name=".service.AODService"
            android:exported="true"
            android:permission="android.permission.BIND_DREAM_SERVICE">
            <intent-filter>
                <action android:name="android.service.dreams.DreamService" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </service>

        <!-- Background Sync Service -->
        <service
            android:name=".service.BackgroundSyncService"
            android:enabled="true"
            android:exported="false" />

        <!-- ML Training Service -->
        <service
            android:name=".service.MLTrainingService"
            android:enabled="true"
            android:exported="false" />

        <!-- Notification Receiver -->
        <receiver
            android:name=".receiver.NotificationActionReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="com.yourname.focustimer.ACTION_PAUSE" />
                <action android:name="com.yourname.focustimer.ACTION_RESUME" />
                <action android:name="com.yourname.focustimer.ACTION_SKIP" />
                <action android:name="com.yourname.focustimer.ACTION_STOP" />
            </intent-filter>
        </receiver>

        <!-- Boot Receiver (for scheduled tasks) -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true"
            android:permission="android.permission.RECEIVE_BOOT_COMPLETED">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <!-- WorkManager Initialization -->
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="${applicationId}.androidx-startup"
            android:exported="false"
            tools:node="merge">
            <meta-data
                android:name="androidx.work.WorkManagerInitializer"
                android:value="androidx.startup" />
        </provider>

        <!-- File Provider (for exports) -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
```

***

## **requirements.txt (ML Training)**

```txt
# Core ML Libraries
tensorflow==2.15.0
tensorflow-datasets==4.9.3
numpy==1.24.3
pandas==2.1.4
scikit-learn==1.3.2

# Deep Learning
torch==2.1.2
transformers==4.36.2
peft==0.7.1
bitsandbytes==0.41.3
accelerate==0.25.0

# Data Processing
nltk==3.8.1
spacy==3.7.2
python-dateutil==2.8.2

# Visualization
matplotlib==3.8.2
seaborn==0.13.0
plotly==5.18.0

# Model Optimization
onnx==1.15.0
onnxruntime==1.16.3

# Utilities
tqdm==4.66.1
pyyaml==6.0.1
python-dotenv==1.0.0
jupyter==1.0.0
ipykernel==6.27.1

# Testing
pytest==7.4.3
pytest-cov==4.1.0
```

***

## **config.yaml (ML Training Config)**

```yaml
# Training Configuration
training:
  batch_size: 32
  epochs: 50
  learning_rate: 0.001
  validation_split: 0.2
  early_stopping_patience: 10
  checkpoint_dir: "data/models/"
  
# LSTM Model Config
lstm:
  sequence_length: 10
  embedding_dim: 32
  hidden_units: [128, 64]
  dropout: 0.2
  output_units: 3
  
# DQN Config
dqn:
  state_dim: 20
  action_dim: 50
  hidden_units: [128, 64, 32]
  replay_buffer_size: 10000
  target_update_frequency: 1000
  epsilon_start: 1.0
  epsilon_end: 0.1
  epsilon_decay: 0.995
  gamma: 0.95
  
# Gemma Fine-tuning Config
gemma:
  base_model: "google/gemma-2b-it"
  lora_rank: 16
  lora_alpha: 32
  lora_dropout: 0.05
  max_seq_length: 512
  learning_rate: 0.00002
  batch_size: 4
  gradient_accumulation_steps: 4
  num_train_epochs: 3
  
# Data Paths
data:
  whatsapp_path: "data/raw/whatsapp_chat.txt"
  diary_path: "data/raw/diary_entries.txt"
  task_logs_path: "data/raw/task_logs.csv"
  training_output: "data/processed/training_data.csv"
  
# TFLite Conversion
tflite:
  quantization: "int4"
  optimization: "default"
  representative_dataset_size: 100
```

***

## **proguard-rules.pro**

```pro
# Keep model classes
-keep class com.yourname.focustimer.domain.model.** { *; }
-keep class com.yourname.focustimer.data.local.database.entity.** { *; }

# TensorFlow Lite
-keep class org.tensorflow.lite.** { *; }
-keep class org.tensorflow.lite.gpu.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Hilt
-keep class dagger.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.lifecycle.HiltViewModel

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keep,includedescriptorclasses class com.yourname.focustimer.**$$serializer { *; }
-keepclassmembers class com.yourname.focustimer.** {
    *** Companion;
}

# Compose
-dontwarn androidx.compose.runtime.**
```

***

## **.gitignore**

```gitignore
# Built application files
*.apk
*.aab
*.ap_
*.asar

# Files for the ART/Dalvik VM
*.dex

# Java class files
*.class

# Generated files
bin/
gen/
out/
build/
.gradle/
.idea/
*.iml
local.properties

# Gradle files
.gradle/
build/
gradle-app.setting
!gradle-wrapper.jar

# Local configuration file (secrets)
local.properties
secrets.properties

# IntelliJ
*.iml
.idea/
.idea/workspace.xml
.idea/tasks.xml
.idea/gradle.xml
.idea/assetWizardSettings.xml
.idea/dictionaries
.idea/libraries

# Keystore files
*.jks
*.keystore

# External native build folder generated in Android Studio 2.2 and later
.externalNativeBuild
.cxx/

# Android Studio 3.x+ generated files
*.iml
.idea/
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx

# ML Models (large files)
*.tflite
*.pb
*.h5
*.ckpt
*.pth

# Data files
/ml/data/raw/
/ml/data/processed/
*.csv
*.txt
*.json

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv
pip-log.txt
pip-delete-this-directory.txt
.pytest_cache/

# Jupyter Notebook
.ipynb_checkpoints
*.ipynb

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Release keys
release/
keystore/
```

***

# 🚀 **COMPREHENSIVE DEVELOPMENT ROADMAP**

## **SPRINT 1: Foundation (Weeks 1-4)**

### **Week 1: Setup & Core Infrastructure**
```
Day 1-2: Project Setup
✓ Create Android Studio project
✓ Set up Git repository
✓ Configure Gradle dependencies
✓ Set up Hilt DI
✓ Create folder structure

Day 3-4: Database Layer
✓ Design Room database schema
✓ Create all entities
✓ Implement DAOs
✓ Write migration scripts
✓ Create repository interfaces

Day 5-7: Core Domain Logic
✓ Create domain models
✓ Implement use cases
✓ Set up repository pattern
✓ Write unit tests (80% coverage)
```

### **Week 2: Basic UI**
```
Day 1-3: Theme & Design System
✓ Set up Compose theme
✓ Define color palette
✓ Create typography system
✓ Build reusable components
✓ Implement dark/light themes

Day 4-7: Core Screens
✓ Home screen with task list
✓ Task creation screen
✓ Task edit screen
✓ Navigation setup
✓ Basic state management
```

### **Week 3: Timer Core**
```
Day 1-3: Timer Logic
✓ Implement countdown algorithm
✓ Create timer state machine
✓ Handle pause/resume
✓ Implement skip functionality
✓ Add reset feature

Day 4-7: Timer Service
✓ Create foreground service
✓ Implement notification
✓ Handle lifecycle events
✓ Add sound playback
✓ Implement vibration
```

### **Week 4: Task Rotation**
```
Day 1-3: Rotation Engine
✓ Implement task queue
✓ Auto-advance logic
✓ Loop detection
✓ Handle edge cases
✓ Persistence

Day 4-7: Integration & Testing
✓ Integrate timer with rotation
✓ End-to-end testing
✓ Bug fixes
✓ Performance optimization
✓ Alpha release (internal)
```

***

## **SPRINT 2: Enhanced Features (Weeks 5-8)**

### **Week 5: Visual Timers Part 1**
```
Day 1-2: Analog Clock
✓ Design clock face
✓ Rotating hand animation
✓ Tick marks
✓ Time labels

Day 3-4: Progress Ring
✓ Circular SVG path
✓ Stroke animation
✓ Color transitions
✓ Percentage display

Day 5-7: Pixel Hourglass
✓ Design pixel sprites (60 frames)
✓ Frame-by-frame animation
✓ Particle effects
✓ Blinking pixel
```

### **Week 6: Visual Timers Part 2**
```
Day 1-2: Pac-Man Timer
✓ Pac-Man sprite animation
✓ Dot consumption
✓ Movement logic
✓ Sound effects

Day 3-4: Space Invaders
✓ Alien sprites
✓ Laser animation
✓ Explosion effects
✓ Speed increase logic

Day 5-7: Tetris Timer
✓ Tetromino pieces
✓ Falling animation
✓ Line clearing
✓ Stack physics
```

### **Week 7: Folder System**
```
Day 1-3: Folder Management
✓ Create folder UI
✓ Folder CRUD operations
✓ Color/icon picker
✓ Hierarchical structure

Day 4-7: Task Organization
✓ Assign tasks to folders
✓ Bulk operations
✓ Search & filter
✓ Statistics per folder
```

### **Week 8: Statistics**
```
Day 1-3: Data Aggregation
✓ Calculate daily stats
✓ Weekly/monthly summaries
✓ Streak calculation
✓ Focus quality metrics

Day 4-7: Visualization
✓ Bar charts (last 7 days)
✓ Pie chart (categories)
✓ Calendar heatmap
✓ Export to CSV
```

***

## **SPRINT 3: Advanced Features (Weeks 9-16)**

### **Weeks 9-10: Eisenhower Matrix**
```
✓ 4-quadrant layout
✓ Drag-drop between quadrants
✓ Priority auto-assignment
✓ Color coding
✓ Quick actions
✓ Matrix statistics
```

### **Weeks 11-12: Complex Rotation**
```
✓ Pattern editor UI
✓ Inner loop logic
✓ Sequential chains
✓ IF/ELSE conditions
✓ Template system
✓ Pattern validation
```

### **Weeks 13-14: Brain Dump**
```
✓ Floating quick-add button
✓ Voice-to-text
✓ Inbox screen
✓ Processing workflow
✓ Snooze feature
✓ Batch operations
```

### **Weeks 15-16: Gamification**
```
✓ Achievement database
✓ XP calculation
✓ Level system
✓ Unlock logic
✓ Daily challenges
✓ Streak bonuses
✓ Medal UI
```

***

## **SPRINT 4: AI/ML (Weeks 17-24)**

### **Weeks 17-18: Data Collection**
```
✓ Log all user interactions
✓ Track task completions
✓ Record pause/skip events
✓ Capture time-based features
✓ Store focus quality ratings
✓ 2 weeks of personal data
```

### **Weeks 19-20: LSTM Training**
```
✓ Export training data
✓ Preprocess features
✓ Build LSTM architecture
✓ Train model (50 epochs)
✓ Validate performance
✓ Convert to TFLite
✓ Integrate in app
```

### **Weeks 21-22: DQN Training**
```
✓ Implement state space
✓ Define reward function
✓ Create replay buffer
✓ Train DQN agent
✓ Test recommendations
✓ Convert to TFLite
✓ Add explainability
```

### **Weeks 23-24: Personal Data Training**
```
✓ Export WhatsApp/diary
✓ Parse and clean data
✓ Create training dataset
✓ Fine-tune Gemma 2B
✓ Evaluate responses
✓ Optimize and quantize
✓ Deploy in app
```

***

## **SPRINT 5: Advanced UI (Weeks 25-32)**

### **Weeks 25-27: Logic Canvas**
```
✓ Infinite canvas implementation
✓ Node components (all types)
✓ Drag-drop nodes
✓ Connection drawing
✓ Zoom/pan controls
✓ Logic evaluation engine
✓ Save/load canvas
```

### **Weeks 28-29: Floating Overlay**
```
✓ Request overlay permission
✓ WindowManager integration
✓ Floating timer UI
✓ Drag gesture
✓ Minimize/expand
✓ Click-through mode
✓ Multi-device testing
```

### **Weeks 30-31: AOD Integration**
```
✓ DreamService implementation
✓ AOD layout design
✓ OLED optimization
✓ Low-power rendering
✓ Battery testing
✓ Lock/unlock handling
```

### **Week 32: Polish**
```
✓ Screen flash effects
✓ Audio masking system
✓ Animation refinement
✓ Performance optimization
✓ Accessibility features
✓ RTL support
```

***

## **SPRINT 6: Testing & Release (Weeks 33-40)**

### **Weeks 33-35: Comprehensive Testing**
```
✓ Unit tests (90% coverage)
✓ Integration tests
✓ UI tests (Espresso)
✓ Performance profiling
✓ Memory leak detection
✓ Battery drain testing
✓ Stress testing
✓ Edge case handling
```

### **Weeks 36-37: Bug Fixing**
```
✓ Fix critical bugs
✓ Fix high-priority bugs
✓ Fix medium-priority bugs
✓ Regression testing
✓ Code review
✓ Refactoring
```

### **Weeks 38-39: Documentation**
```
✓ Write user guide
✓ Create video tutorials
✓ API documentation
✓ Code documentation
✓ Privacy policy
✓ Terms of service
✓ FAQ page
```

### **Week 40: Launch Preparation**
```
✓ Design app store assets
✓ Write app description
✓ Create screenshots (8)
✓ Feature graphic
✓ Promo video
✓ Set up Play Console
✓ Alpha/Beta testing
✓ Final QA
✓ LAUNCH! 🚀
```

***

# 🎯 **SUCCESS METRICS & MILESTONES**

## **Technical Milestones**

### **Phase 1 Complete (Week 4):**
✅ Basic timer works accurately
✅ Task creation/editing functional
✅ Database persistence working
✅ Notifications implemented
✅ 50+ unit tests passing

### **Phase 2 Complete (Week 8):**
✅ 5+ visual timer styles
✅ Folder system working
✅ Statistics dashboard live
✅ 100+ unit tests passing
✅ App size < 50 MB

### **Phase 3 Complete (Week 16):**
✅ Eisenhower matrix functional
✅ Complex rotation working
✅ Brain dump feature live
✅ Gamification implemented
✅ 200+ unit tests passing

### **Phase 4 Complete (Week 24):**
✅ LSTM model accuracy >85%
✅ DQN recommendation quality >80%
✅ Gemma responses relevant
✅ Inference time <2s
✅ Model size < 1.5 GB

### **Phase 5 Complete (Week 32):**
✅ Logic canvas functional
✅ Floating overlay stable
✅ AOD battery drain <5%/hr
✅ All animations smooth (60fps)
✅ 300+ unit tests passing

### **Phase 6 Complete (Week 40):**
✅ Zero critical bugs
✅ <5 high-priority bugs
✅ 90% code coverage
✅ Performance: App launch <2s
✅ APK size < 100 MB
✅ Published on Play Store

***

## **User Success Metrics**

### **MVP Success (After 1 Month):**
- 100 daily active users
- Average session: 30+ minutes
- Task completion rate: >70%
- App rating: >4.0 stars
- Crash-free rate: >99%

### **Growth Success (After 3 Months):**
- 1,000 daily active users
- Average session: 45+ minutes
- User retention (D7): >40%
- App rating: >4.3 stars
- Positive reviews mentioning ADHD

### **Long-term Success (After 6 Months):**
- 10,000+ installs
- 5,000 daily active users
- Average session: 60+ minutes
- User retention (D30): >25%
- App rating: >4.5 stars
- Featured on Play Store

***

# 📝 **FINAL TODO SUMMARY**

## **Immediate Next Steps (This Week):**

1. ✅ **Decision Point:** Use existing app (RoutineFlow) OR build custom?
   - Try RoutineFlow for 7 days
   - Document what works/doesn't work
   - List missing features

2. **If Building Custom:**
   - [ ] Set up Android Studio project
   - [ ] Create GitHub repository
   - [ ] Design basic mockups (Figma/paper)
   - [ ] List MVP features only
   - [ ] Time estimate: 4-6 weeks

3. **ML Preparation:**
   - [ ] Export WhatsApp chats
   - [ ] Collect diary entries
   - [ ] Start logging tasks manually
   - [ ] Save for training later

***

## **Critical Path Dependencies:**

```
Database → Repository → ViewModel → UI
   ↓
Timer Logic → Service → Notification
   ↓
Task Rotation → Complex Patterns
   ↓
Data Collection → ML Training → Model Deployment
   ↓
Polish → Testing → Release
```

***

# 🎉 **CONCLUSION**

You now have:

✅ **Complete architecture** - Every component mapped
✅ **Detailed file structure** - 500+ files organized
✅ **Full feature list** - 200+ features prioritized
✅ **40-week roadmap** - Sprint-by-sprint plan
✅ **ML pipeline** - Training to deployment
✅ **Success metrics** - Clear goals

**This is everything you need to build Focus Timer Pro.**

**Next step:** Try RoutineFlow TODAY. If it doesn't meet your needs, come back and we'll start Phase 1 immediately! 🚀
 