
# 🎯 **DIGITAL DATA COLLECTION INTEGRATION PLAN**
## *For Your Focus Timer App - ML Training Ready*

***

## 📊 **COMPLETE DATA POINTS MAPPING**

### **Category 1: Task Creation Data (Automatic + Manual)**

| Data Point | Type | Collection Method | Database Field | UI Component |
|------------|------|-------------------|----------------|--------------|
| **task_id** | Auto | Auto-increment | `id: Long` | Hidden |
| **task_title** | Manual | Text input | `name: String` | TextField |
| **task_type** | Manual | Dropdown | `category: String` | Dropdown/Chips |
| **importance** | Manual | Slider 0-1 | `importance: Float` | Slider with labels |
| **urgency** | Auto-calc | Deadline-based | `urgency: Float` | Auto-computed |
| **optionality** | Manual | Counter | `optionality: Float` | Stepper + helper |
| **cost_time** | Manual | Time picker | `estimatedDuration: Int` | Duration picker |
| **cost_cognitive** | Manual | Slider 0-1 | `cognitiveLoad: Float` | Energy bar slider |
| **deadline** | Manual | Date picker | `deadline: Long` | DateTimePicker |
| **created_at** | Auto | System time | `createdAt: Long` | Auto-timestamp |
| **dependencies** | Manual | Multi-select | `dependsOn: String (JSON)` | Chip selector |

### **Category 2: Task Completion Data (Post-Task Survey)**

| Data Point | Type | Collection Method | Database Field | UI Component |
|------------|------|-------------------|----------------|--------------|
| **completed_at** | Auto | System time | `completedAt: Long` | Auto-timestamp |
| **realized_roi** | Manual | Star rating | `realizedROI: Int (0-5)` | 5-star rating |
| **actual_time** | Auto | Timer tracking | `actualDuration: Int` | Auto-tracked |
| **time_accuracy** | Auto-calc | Estimated vs Actual | `timeAccuracy: Int (0-5)` | Auto-computed |
| **actual_cognitive** | Manual | Slider | `actualCognitive: Int (0-5)` | Slider + emoji |
| **cognitive_accuracy** | Auto-calc | Estimated vs Actual | `cognitiveAccuracy: Int (0-5)` | Auto-computed |
| **satisfaction** | Manual | Emoji rating | `satisfaction: Int (0-5)` | Emoji selector |
| **completion_notes** | Manual | Text (optional) | `notes: String?` | TextField |

### **Category 3: Daily State Data (Evening/Morning)**

| Data Point | Type | Collection Method | Database Field | UI Component |
|------------|------|-------------------|----------------|--------------|
| **date** | Auto | System date | `date: String (YYYY-MM-DD)` | Auto |
| **morning_energy** | Manual | Slider | `morningEnergy: Int (0-5)` | Quick slider |
| **evening_energy** | Manual | Slider | `eveningEnergy: Int (0-5)` | Quick slider |
| **fatigue_level** | Manual | Slider 0-1 | `fatigueLevel: Float` | Battery indicator |
| **deep_work_hours** | Auto | From sessions | `deepWorkHours: Float` | Auto-calculated |
| **rest_quality** | Manual | Star rating | `restQuality: Int (0-5)` | Star selector |
| **sleep_hours** | Manual | Number input | `sleepHours: Float` | Number stepper |

### **Category 4: Session Metadata (Automatic Background Collection)**

| Data Point | Type | Collection Method | Database Field | Purpose |
|------------|------|-------------------|----------------|---------|
| **session_id** | Auto | UUID | `sessionId: String` | Unique identifier |
| **time_of_day** | Auto | System clock | `hourOfDay: Int (0-23)` | Circadian patterns |
| **day_of_week** | Auto | Calendar | `dayOfWeek: Int (1-7)` | Weekly patterns |
| **pause_count** | Auto | Timer pauses | `pauseCount: Int` | Focus quality |
| **interruption_count** | Auto | App switches | `interruptionCount: Int` | Distraction tracking |
| **focus_duration** | Auto | Uninterrupted time | `focusDuration: Int` | Quality metric |
| **screen_interactions** | Auto | Touch events | `screenTouches: Int` | Attention proxy |

***

## 🏗️ **DATABASE SCHEMA ADDITIONS**

### **New Table: TaskMetrics**
```kotlin
@Entity(tableName = "task_metrics")
data class TaskMetrics(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val taskId: Long, // FK to Task
    
    // Creation Phase
    val importance: Float, // 0.0-1.0
    val urgency: Float, // 0.0-1.0 (auto-calculated from deadline)
    val optionality: Float, // 0.0-1.0
    val estimatedTime: Int, // minutes
    val estimatedCognitive: Float, // 0.0-1.0
    val createdAtHour: Int, // 0-23
    val createdAtDayOfWeek: Int, // 1-7
    
    // Completion Phase
    val completedAtHour: Int?, // 0-23
    val completedAtDayOfWeek: Int?, // 1-7
    val realizedROI: Int?, // 0-5
    val actualTime: Int?, // minutes
    val timeAccuracy: Int?, // 0-5 (calculated)
    val actualCognitive: Int?, // 0-5
    val cognitiveAccuracy: Int?, // 0-5 (calculated)
    val satisfaction: Int?, // 0-5
    val completionNotes: String?,
    
    // Context
    val userEnergyAtCreation: Int?, // 0-5 (from daily state)
    val userFatigueAtCreation: Float?, // 0.0-1.0
    val previousTaskROI: Int?, // ROI of last completed task
    val tasksCompletedToday: Int // Count at creation time
)
```

### **New Table: DailyState**
```kotlin
@Entity(tableName = "daily_state")
data class DailyState(
    @PrimaryKey val date: String, // YYYY-MM-DD
    
    // Morning (logged when first opening app after 6 AM)
    val morningEnergy: Int?, // 0-5
    val morningLoggedAt: Long?,
    
    // Evening (logged before 11 PM or via reminder)
    val eveningEnergy: Int?, // 0-5
    val fatigueLevel: Float?, // 0.0-1.0
    val restQuality: Int?, // 0-5
    val eveningLoggedAt: Long?,
    
    // Sleep (logged next morning)
    val sleepHours: Float?, // hours
    val sleepQuality: Int?, // 0-5 (optional)
    
    // Auto-calculated from sessions
    val totalDeepWorkMinutes: Int = 0,
    val sessionsCompleted: Int = 0,
    val tasksCompleted: Int = 0,
    val avgFocusQuality: Float = 0f,
    
    // Weekly context
    val weekNumber: Int, // ISO week
    val isWeekend: Boolean
)
```

### **New Table: SessionDetailedMetrics**
```kotlin
@Entity(tableName = "session_detailed_metrics")
data class SessionDetailedMetrics(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sessionId: Long, // FK to FocusSession
    val taskId: Long,
    
    // Timing
    val startedAt: Long,
    val completedAt: Long?,
    val plannedDuration: Int, // seconds
    val actualDuration: Int?, // seconds
    
    // Focus Quality Indicators
    val pauseCount: Int = 0,
    val skipReason: String? = null,
    val interruptionCount: Int = 0, // app switches
    val screenTouchCount: Int = 0,
    val longestFocusStreak: Int = 0, // seconds without pause
    
    // Context
    val hourOfDay: Int, // 0-23
    val dayOfWeek: Int, // 1-7
    val isWeekend: Boolean,
    val weatherCondition: String? = null, // optional
    val locationContext: String? = null, // "home", "library", etc.
    
    // Physiological (if available from wearables - future)
    val heartRate: Int? = null,
    val heartRateVariability: Float? = null
)
```

### **Update Existing: FocusSession**
```kotlin
@Entity(tableName = "focus_sessions")
data class FocusSession(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val taskId: Long,
    
    // Existing fields...
    val plannedDuration: Int,
    val actualDuration: Int,
    val completedAt: Long,
    val wasCompleted: Boolean,
    
    // NEW: Link to detailed metrics
    val hasDetailedMetrics: Boolean = false,
    
    // NEW: Immediate post-completion data
    val focusQualitySelfRated: Int? = null, // 0-5 (user rates focus)
    val distractionLevel: Int? = null, // 0-5 (user rates distractions)
    val energyAfterSession: Int? = null // 0-5 (energy level after)
)
```

***

## 🎨 **UI/UX IMPLEMENTATION PLAN**

### **Phase 1: Task Creation - Enhanced Input**

**Screen: Create/Edit Task**

```kotlin
@Composable
fun EnhancedTaskCreationScreen() {
    Column {
        // Basic info
        TextField(label = "Task Title")
        DropdownMenu(label = "Category", items = listOf(
            "Research", "Coding", "Coursework", 
            "Admin", "Social"
        ))
        
        // ML Data Collection Section
        ExpandableCard(title = "Task Details (helps AI learn)") {
            
            // Importance
            SliderWithLabels(
                label = "How important?",
                value = importance,
                range = 0f..1f,
                labels = mapOf(
                    0f to "Optional",
                    0.5f to "Important",
                    1f to "Critical"
                ),
                helpText = "Will skipping this cause problems?"
            )
            
            // Deadline (urgency auto-calculated)
            DateTimePicker(
                label = "Deadline",
                onDateSelected = { date ->
                    // Auto-calculate urgency based on days left
                    urgency = calculateUrgency(date)
                }
            )
            DisplayChip(
                text = "Urgency: ${urgency.toPercent()}",
                color = urgencyColor(urgency)
            )
            
            // Optionality
            NumberStepper(
                label = "Unlocks how many other tasks?",
                value = unlockCount,
                min = 0,
                max = 10,
                onChange = { count ->
                    optionality = calculateOptionality(count)
                }
            )
            
            // Time Estimate
            DurationPicker(
                label = "Estimated time",
                value = estimatedMinutes,
                presets = listOf(15, 30, 60, 120, 240) // quick buttons
            )
            
            // Cognitive Load
            EnergyBarSlider(
                label = "Mental effort needed",
                value = cognitiveLoad,
                icons = listOf("😴", "🙂", "🤔", "😰", "🤯"),
                helpText = "Deep focus required?"
            )
        }
    }
}
```

**Key Feature: Smart Defaults**
```kotlin
// Pre-fill based on historical data
fun suggestTaskMetrics(title: String, category: String): TaskMetrics {
    // Query similar past tasks
    val similarTasks = repository.findSimilarTasks(title, category)
    
    return TaskMetrics(
        importance = similarTasks.avgImportance,
        estimatedTime = similarTasks.avgTime,
        estimatedCognitive = similarTasks.avgCognitive,
        // Show to user: "Based on similar tasks..."
    )
}
```

***

### **Phase 2: Post-Completion Survey**

**Trigger: When timer completes or user marks task done**

**Option A: Quick 3-Tap Survey (Recommended)**

```kotlin
@Composable
fun QuickCompletionSurvey(taskName: String) {
    Dialog {
        Column(padding = 16.dp) {
            Text("Great job on: $taskName! 🎉")
            
            // Question 1: ROI
            Text("How valuable was this?", style = boldTitle)
            StarRating(
                count = 5,
                selected = realizedROI,
                labels = mapOf(
                    1 to "Waste",
                    3 to "Expected",
                    5 to "Amazing!"
                )
            )
            
            // Question 2: Difficulty
            Text("How was the difficulty?", style = boldTitle)
            ComparisonSlider(
                label = "Easier ← → Harder",
                value = cognitiveAccuracy,
                range = 0..5,
                neutral = 3 // "As expected"
            )
            
            // Question 3: Satisfaction
            Text("How satisfied are you?", style = boldTitle)
            EmojiRating(
                emojis = listOf("😞", "😕", "😐", "🙂", "😄", "🤩"),
                selected = satisfaction
            )
            
            // Optional note
            TextField(
                label = "Quick note (optional)",
                singleLine = true,
                placeholder = "What did you learn?"
            )
            
            Button("Submit & Continue") {
                saveMetrics()
                showNextTask()
            }
        }
    }
}
```

**Option B: Skip Survey (with reminder)**

```kotlin
// If user dismisses survey
scheduleReminderNotification(
    delay = 5.minutes,
    message = "Quick feedback on '$taskName'? (30 seconds)"
)

// Allow batch review at end of day
fun showBatchReviewScreen() {
    // Show all tasks completed today without feedback
    // User can rate multiple in one go
}
```

***

### **Phase 3: Daily State Collection**

**Trigger 1: Morning (First app open after 6 AM)**

```kotlin
@Composable
fun MorningEnergyPrompt() {
    BottomSheet(dismissible = true) {
        Column {
            Text("Good morning! ☀️", style = headerStyle)
            Text("How's your energy level?")
            
            EnergySlider(
                value = morningEnergy,
                icons = listOf("😴", "😪", "🙂", "😊", "🤩"),
                onChange = { energy ->
                    saveDailyState(morningEnergy = energy)
                }
            )
            
            // Optional: Sleep tracking
            if (yesterdaySleepNotLogged) {
                Text("How many hours did you sleep?")
                NumberPicker(
                    value = sleepHours,
                    range = 0f..12f,
                    step = 0.5f
                )
            }
            
            Button("Let's go! 💪") {
                dismiss()
            }
        }
    }
}
```

**Trigger 2: Evening (Notification at 9 PM)**

```kotlin
fun scheduleEveningPrompt() {
    // Show notification at 21:00
    NotificationManager.schedule(
        time = "21:00",
        title = "Daily Check-in",
        message = "How was your day? (2 minutes)",
        action = "OPEN_EVENING_SURVEY"
    )
}

@Composable
fun EveningStateScreen() {
    Column(padding = 16.dp) {
        Text("End of day check-in 🌙", style = headerStyle)
        
        // Auto-show stats
        Card {
            Text("Today: ${deepWorkHours}h focused")
            Text("Completed: ${tasksCompleted} tasks")
        }
        
        // Energy
        SliderQuestion(
            question = "Energy level now?",
            value = eveningEnergy,
            range = 0..5
        )
        
        // Fatigue
        SliderQuestion(
            question = "How tired are you?",
            value = fatigueLevel,
            range = 0f..1f,
            labels = mapOf(
                0f to "Fresh 💪",
                0.5f to "Normal",
                1f to "Exhausted 😴"
            )
        )
        
        // Rest Quality
        StarRating(
            question = "Quality of breaks today?",
            value = restQuality
        )
        
        Button("Done for today ✅") {
            saveDailyState()
            showMotivationalMessage()
        }
    }
}
```

***

### **Phase 4: Automatic Background Collection**

**Implementation: TimerService Enhancement**

```kotlin
class TimerService : Service() {
    private var sessionStartTime: Long = 0
    private var pauseCount = 0
    private var screenTouchCount = 0
    private var lastInteractionTime: Long = 0
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Track session start
        sessionStartTime = System.currentTimeMillis()
        
        // Register lifecycle callbacks
        registerActivityLifecycleCallbacks(FocusTracker())
        
        // Start touch event monitoring
        startTouchTracking()
        
        return START_STICKY
    }
    
    inner class FocusTracker : Application.ActivityLifecycleCallbacks {
        override fun onActivityPaused(activity: Activity) {
            // App went to background = interruption
            interruptionCount++
        }
        
        override fun onActivityResumed(activity: Activity) {
            // Resumed - calculate interruption duration
            val interruptionDuration = System.currentTimeMillis() - lastInteractionTime
            // Log this
        }
    }
    
    private fun startTouchTracking() {
        // Overlay window to count touches (non-intrusive)
        windowManager.addView(transparentOverlay, params)
        transparentOverlay.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN) {
                screenTouchCount++
            }
            false // Pass through
        }
    }
    
    fun onSessionComplete() {
        // Save all metrics
        val metrics = SessionDetailedMetrics(
            sessionId = currentSessionId,
            taskId = currentTaskId,
            startedAt = sessionStartTime,
            completedAt = System.currentTimeMillis(),
            pauseCount = pauseCount,
            interruptionCount = interruptionCount,
            screenTouchCount = screenTouchCount,
            longestFocusStreak = calculateLongestStreak(),
            hourOfDay = Calendar.getInstance().get(Calendar.HOUR_OF_DAY),
            dayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
        )
        
        repository.saveSessionMetrics(metrics)
    }
}
```

***

## ⚡ **OPTIMIZATION STRATEGIES**

### **1. Progressive Data Collection**

**Week 1-2: Core Only (Minimize Friction)**
```kotlin
val coreMetrics = listOf(
    "importance",
    "estimatedTime", 
    "realizedROI", // POST-TASK
    "satisfaction"  // POST-TASK
)
// Everything else: optional or auto-collected
```

**Week 3-4: Expand Gradually**
```kotlin
// Add after user is comfortable:
+ cognitiveLoad
+ urgency (auto-calculated)
+ daily energy tracking
```

**Month 2+: Full Suite**
```kotlin
// All metrics enabled
// User sees value from ML suggestions
```

### **2. Smart Defaults & Auto-Fill**

```kotlin
class TaskMetricsPredictor(private val repository: TaskRepository) {
    
    suspend fun suggestMetrics(
        title: String,
        category: String,
        deadline: LocalDate?
    ): TaskMetricsSuggestion {
        
        // Find similar historical tasks
        val similar = repository.searchTasks(
            query = extractKeywords(title),
            category = category,
            limit = 10
        )
        
        if (similar.isNotEmpty()) {
            return TaskMetricsSuggestion(
                importance = similar.map { it.importance }.average(),
                estimatedTime = similar.map { it.estimatedTime }.median(),
                cognitiveLoad = similar.map { it.cognitiveLoad }.average(),
                confidence = calculateConfidence(similar.size),
                explanation = "Based on ${similar.size} similar tasks"
            )
        }
        
        // Fallback: category defaults
        return getDefaultsForCategory(category)
    }
}
```

### **3. Batch Input for Multiple Tasks**

```kotlin
@Composable
fun QuickBatchTaskCreation() {
    Column {
        Text("Creating ${tasks.size} tasks")
        
        // Apply same metrics to all
        Card(title = "Apply to all:") {
            SliderWithLabels("Importance", importance)
            DropdownMenu("Category", category)
            DurationPicker("Estimated time", estimatedTime)
        }
        
        // Individual task titles
        tasks.forEach { task ->
            TextField(value = task.title)
            // Option to override metrics per task
            if (task.needsCustomMetrics) {
                // Show individual sliders
            }
        }
    }
}
```

### **4. Reduce Survey Fatigue**

**Adaptive Frequency**
```kotlin
fun shouldShowCompletionSurvey(task: Task): Boolean {
    return when {
        // Always ask for important tasks
        task.importance > 0.7 -> true
        
        // Random sampling for low-importance
        task.importance < 0.3 -> Random.nextFloat() < 0.3 // 30% chance
        
        // Always ask if it's been >1 hour
        task.actualDuration > 60.minutes -> true
        
        // Adaptive: ask more if user engagement is high
        userHasHighEngagement() -> true
        
        else -> Random.nextFloat() < 0.5 // 50% baseline
    }
}
```

**Quick vs Detailed Survey**
```kotlin
// Short version (5 seconds)
QuickSurvey {
    StarRating("Value?", realizedROI)
}

// Long version (30 seconds) - shown randomly 20% of time
DetailedSurvey {
    StarRating("Value?", realizedROI)
    Slider("Difficulty?", cognitiveAccuracy)
    EmojiRating("Satisfaction?", satisfaction)
    TextField("Notes?", notes)
}
```

***

## 📥 **DATA EXPORT FOR ML TRAINING**

### **Export Function**

```kotlin
class MLDataExporter(
    private val database: AppDatabase,
    private val context: Context
) {
    
    suspend fun exportTrainingData(
        startDate: LocalDate,
        endDate: LocalDate
    ): File {
        
        // Fetch all relevant data
        val tasks = database.taskDao().getTasksInRange(startDate, endDate)
        val metrics = database.taskMetricsDao().getAll()
        val sessions = database.sessionDao().getAll()
        val dailyStates = database.dailyStateDao().getAll()
        
        // Merge into training format
        val trainingData = tasks.map { task ->
            val taskMetric = metrics.find { it.taskId == task.id }
            val taskSessions = sessions.filter { it.taskId == task.id }
            val dailyState = dailyStates.find { 
                it.date == task.createdAt.toLocalDate().toString()
            }
            
            TrainingDataRow(
                // Features (input)
                task_id = task.id,
                task_title = task.name,
                task_category = task.category,
                importance = taskMetric?.importance ?: 0f,
                urgency = taskMetric?.urgency ?: 0f,
                optionality = taskMetric?.optionality ?: 0f,
                estimated_time = taskMetric?.estimatedTime ?: 0,
                estimated_cognitive = taskMetric?.estimatedCognitive ?: 0f,
                
                // Context
                created_hour = taskMetric?.createdAtHour ?: 0,
                created_day_of_week = taskMetric?.createdAtDayOfWeek ?: 0,
                user_morning_energy = dailyState?.morningEnergy ?: 3,
                user_fatigue = dailyState?.fatigueLevel ?: 0.5f,
                tasks_completed_today = taskMetric?.tasksCompletedToday ?: 0,
                
                // Session data
                pause_count = taskSessions.sumOf { it.pauseCount },
                interruption_count = taskSessions.sumOf { it.interruptionCount },
                
                // Labels (output / target)
                realized_roi = taskMetric?.realizedROI,
                actual_time = taskMetric?.actualTime,
                actual_cognitive = taskMetric?.actualCognitive,
                satisfaction = taskMetric?.satisfaction,
                was_completed = task.isCompleted
            )
        }
        
        // Export to CSV
        val csvFile = File(context.filesDir, "training_data_${System.currentTimeMillis()}.csv")
        CSVWriter(csvFile).use { writer ->
            writer.writeHeader(TrainingDataRow::class)
            trainingData.forEach { writer.writeRow(it) }
        }
        
        return csvFile
    }
}
```

### **Export UI**

```kotlin
@Composable
fun MLDataExportScreen() {
    Column {
        Text("Export Data for ML Training", style = headerStyle)
        
        // Date range selector
        DateRangePicker(
            startDate = exportStartDate,
            endDate = exportEndDate
        )
        
        // Stats preview
        Card {
            Text("Tasks: ${taskCount}")
            Text("Sessions: ${sessionCount}")
            Text("Days: ${dayCount}")
            Text("Estimated size: ${estimatedMB} MB")
        }
        
        // Export button
        Button("Export CSV") {
            scope.launch {
                val file = exporter.exportTrainingData(startDate, endDate)
                shareFile(file) // Share via any app
            }
        }
        
        // Cloud sync option
        if (cloudSyncEnabled) {
            Button("Upload to Google Drive") {
                uploadToCloud(file)
            }
        }
    }
}
```

***

## 🚀 **IMPLEMENTATION ROADMAP**

### **SPRINT 1: Core Data Collection (Week 1)**

**Priority: Get basic ML data flowing**

✅ **Day 1-2: Database Schema**
```
✅ Create TaskMetrics entity
✅ Create DailyState entity  
✅ Add migration scripts
✅ Update DAOs
✅ Write repository methods
□ Unit tests for DAOs
```

✅ **Day 3-4: Task Creation UI**
```
✅ Add importance slider
✅ Add deadline picker (auto-calc urgency)
✅ Add time estimate picker
✅ Add cognitive load slider
□ Smart defaults based on category
✅ Save metrics to database
```

✅ **Day 5-7: Post-Completion Survey**
```
✅ Design QuickCompletionSurvey dialog
✅ Implement 3-question survey:
  - Realized ROI (stars)
  - Difficulty comparison (slider)
  - Satisfaction (emoji)
✅ Show after task completion
✅ Save to TaskMetrics
✅ Add "Skip" with reminder
□ Test UX flow
```

***

### **SPRINT 2: Daily State & Auto-Tracking (Week 2)**

✅ **Day 1-3: Daily State Collection**
```
✅ Morning energy prompt (bottom sheet)
✅ Evening check-in screen
□ Schedule notifications (9 PM)
✅ Sleep hours tracking
✅ Link daily state to tasks
□ Batch review screen
```

✅ **Day 4-7: Automatic Metrics**
```
✅ Enhance TimerService:
  - Track pause count
  - Monitor app switches (interruptions)
  □ Count screen touches
  - Calculate focus streaks
✅ Create SessionDetailedMetrics entity
✅ Auto-save session data
□ Background data collection
□ Test battery impact
```

***

### **SPRINT 3: Optimization & Export (Week 3)**

✅ **Day 1-3: User Experience Polish**
```
□ Implement smart defaults
□ Add batch task creation
□ Adaptive survey frequency
□ Quick vs detailed survey logic
□ Reduce friction points
□ User testing
```

✅ **Day 4-5: Data Export**
```
□ Build CSV exporter
□ Export UI screen
□ Date range selector
□ Statistics preview
□ Share via Android intent
□ Google Drive integration (optional)
```

✅ **Day 6-7: Validation & Testing**
```
□ Export sample dataset
□ Validate CSV format
□ Check for missing values
□ Ensure privacy (no PII)
□ Test import in Python
□ Documentation
```

***

### **SPRINT 4: ML Integration (Week 4+)**

✅ **Post-Collection (After 2-4 weeks of data)**
```
□ Export dataset (min 100 tasks)
□ Train initial LSTM model
□ Train DQN agent
□ Convert to TFLite
□ Integrate models in app
□ Show predictions to user
□ Collect feedback on predictions
□ Retrain with feedback
```

***

## 📋 **MINIMUM DATA CHECKLIST**

### **For LSTM Duration Predictor (Train after 100 tasks):**
✅ Required:
- `importance` [0-1]
- `urgency` [0-1]  
- `estimated_time` [minutes]
- `actual_time` [minutes] ← TARGET
- `hour_of_day` [0-23]
- `day_of_week` [1-7]

Optional but helpful:
- `cognitive_load` [0-1]
- `user_morning_energy` [0-5]
- `tasks_completed_today` [count]

### **For DQN Task Recommender (Train after 200 tasks):**
✅ Required:
- `importance` [0-1]
- `urgency` [0-1]
- `estimated_time` [minutes]
- `realized_roi` [0-5] ← REWARD SIGNAL
- `user_fatigue` [0-1]
- `hour_of_day` [0-23]

### **For Gemma Personal Assistant (Train after 1000+ messages):**
✅ Required:
- Chat history
- Task completion logs
- WhatsApp export (optional)
- Diary entries (optional)

***

## ⚠️ **CRITICAL IMPLEMENTATION NOTES**

### **1. Privacy & Data Security**

```kotlin
// NEVER export personally identifiable information
fun anonymizeData(data: TrainingDataRow): TrainingDataRow {
    return data.copy(
        task_title = data.task_title.hashCode().toString(), // Hash titles
        task_id = UUID.randomUUID().toString() // New UUID
    )
}

// Encrypt local storage
@Entity(tableName = "task_metrics")
@TypeConverters(EncryptedTypeConverter::class)
data class TaskMetrics(
    // Encrypted at rest
)
```

### **2. Handle Missing Data**

```kotlin
// Fill missing values with reasonable defaults
fun preprocessForML(metrics: TaskMetrics): MLFeatureVector {
    return MLFeatureVector(
        importance = metrics.importance ?: 0.5f, // Default to medium
        urgency = metrics.urgency ?: calculateUrgencyFromDeadline(metrics.deadline),
        cognitiveLoad = metrics.cognitiveLoad ?: 0.5f,
        // ... handle all nullable fields
    )
}
```

### **3. Incremental Data Collection**

```kotlin
// Phase-in data collection to avoid overwhelming users
val dataCollectionPhase = when {
    userTasksCount < 20 -> Phase.MINIMAL // Only critical fields
    userTasksCount < 100 -> Phase.STANDARD // Add more fields
    else -> Phase.COMPLETE // All metrics
}
```

***

## 🎯 **SUCCESS METRICS**

### **Week 1 Goal:**
- ✅ 50+ tasks with complete metrics
- ✅ 80%+ completion survey response rate
- ✅ Zero app crashes related to data collection

### **Week 2 Goal:**
- ✅ 100+ tasks logged
- ✅ 7 days of daily state data
- ✅ Auto-tracking working (session metrics)

### **Week 3 Goal:**
- ✅ Successfully export CSV
- ✅ Validate data quality (no nulls in critical fields)
- ✅ Ready for ML training

### **Week 4 Goal:**
- ✅ Train first model
- ✅ Integrate predictions in app
- ✅ Users see value ("AI suggested this task!")

***

## 💡 **QUICK WIN: Start TODAY**

### **Immediate Action Plan (Next 2 Hours):**

1. **Add Importance Slider** to task creation screen
2. **Add 1-Question Survey** after task completion: "How valuable was this? ⭐⭐⭐⭐⭐"
3. **Log to database** with timestamp
4. **Done!** You're collecting ML data!

### **Code Template:**

```kotlin
// In TaskEditScreen.kt
var importance by remember { mutableStateOf(0.5f) }

Slider(
    value = importance,
    onValueChange = { importance = it },
    valueRange = 0f..1f
)

// In CompleteTaskDialog.kt
var roi by remember { mutableStateOf(3) }

StarRating(
    rating = roi,
    onRatingChanged = { roi = it }
)

Button("Done") {
    saveTaskMetrics(
        TaskMetrics(
            taskId = task.id,
            importance = importance,
            realizedROI = roi,
            completedAt = System.currentTimeMillis()
        )
    )
}
```

***

**You're ready to start collecting data! Begin with the Quick Win, then follow the sprint plan. After 2-3 weeks of data collection, you'll have everything needed for ML training! 🚀**
 