# HabitLens - Accessibility & Guided Testing Implementation Guide

## 🎯 Overview

This guide explains how to make HabitLens accessible to users with low literacy levels and add guided testing/onboarding features.

---

## 📊 System Architecture

The accessibility system consists of:

1. **Visual Hints System** (`visualHints.js`) - Emoji-based status indicators
2. **Guided Tour** (`guidedTour.js`) - Interactive step-by-step walkthrough  
3. **Visual Components** (`VisualComponents.jsx`) - Reusable UI components
4. **CSS Styling** (`visualComponents.css`) - Beautiful visual feedback

---

## 🚀 Implementation Steps

### Step 1: Install Joyride (Tour Library)

```bash
npm install joyride --prefix frontend
```

This library makes the interactive tour work smoothly.

### Step 2: Update DashboardPage.jsx

Add the tour functionality to your main dashboard:

```jsx
import Joyride from 'joyride';
import { tourConfig, hasTourBeenCompleted, markTourCompleted } from '../utils/guidedTour';

export default function DashboardPage() {
  const [tourState, setTourState] = useState(tourConfig);

  // Auto-start tour on first visit
  useEffect(() => {
    if (!hasTourBeenCompleted()) {
      setTourState(prev => ({ ...prev, run: true }));
    }
  }, []);

  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      markTourCompleted();
      setTourState(prev => ({ ...prev, run: false }));
    }
  };

  return (
    <>
      <Joyride {...tourState} callback={handleTourCallback} />
      {/* Rest of your dashboard */}
    </>
  );
}
```

### Step 3: Update Components with Visual Hints

**Example: Update WellnessHabitsSnapshot.jsx**

```jsx
import { VisualTooltip, HealthBadge, ProgressBar } from './VisualComponents';
import { healthIndicators, progressVisual } from '../utils/visualHints';

export function WellnessHabitsSnapshot({ data, t }) {
  return (
    <div className="snapshot-container">
      {/* Sleep Circle with Visual Feedback */}
      <VisualTooltip
        icon="😴"
        label="Sleep Hours"
        message="Try to get 7-8 hours every night for best health"
      >
        <div className="snapshot-bubble-sleep_hours">
          <span>{data.sleep_hours}h</span>
          <span className="metric-status">
            {healthIndicators.sleep.getStatus(data.sleep_hours)}
          </span>
        </div>
      </VisualTooltip>

      {/* Screen Time with Visual Feedback */}
      <VisualTooltip
        icon="📱"
        label="Screen Time"
        message="Less screen time = better for your eyes and brain"
      >
        <div className="snapshot-bubble-screen_time_hours">
          <span>{data.screen_time_hours}h</span>
          <span className="metric-status">
            {healthIndicators.screenTime.getStatus(data.screen_time_hours)}
          </span>
        </div>
      </VisualTooltip>

      {/* Steps with Visual Feedback */}
      <VisualTooltip
        icon="👟"
        label="Daily Steps"
        message="Aim for 10,000 steps per day. Every step counts!"
      >
        <div className="snapshot-bubble-steps">
          <span>{data.steps}</span>
          <span className="metric-status">
            {healthIndicators.steps.getStatus(data.steps)}
          </span>
        </div>
      </VisualTooltip>
    </div>
  );
}
```

### Step 4: Add Visual Feedback to Forms

**Example: Update WellnessForm.jsx**

```jsx
import { FormHint, ValidationFeedback } from './VisualComponents';
import { inputHints, validationIndicators } from '../utils/visualHints';

export function WellnessForm() {
  const [sleepHours, setSleepHours] = useState('');
  const [isValidSleep, setIsValidSleep] = useState(null);

  const handleSleepChange = (e) => {
    const value = parseFloat(e.target.value);
    setSleepHours(value);
    
    // Validate
    if (value < 0 || value > 12) {
      setIsValidSleep(false);
    } else if (value >= 7 && value <= 9) {
      setIsValidSleep(true);
    } else {
      setIsValidSleep(null); // Warning state
    }
  };

  return (
    <div className="form-field">
      <label>Sleep Hours</label>
      
      <FormHint
        icon={inputHints.sleep_hours.icon}
        hint={inputHints.sleep_hours.hint}
        examples={inputHints.sleep_hours.examples}
        recommended={inputHints.sleep_hours.recommended}
      />

      <input
        type="number"
        min={inputHints.sleep_hours.min}
        max={inputHints.sleep_hours.max}
        value={sleepHours}
        onChange={handleSleepChange}
        placeholder="Enter hours"
      />

      {isValidSleep === true && (
        <ValidationFeedback
          isValid={true}
          message={validationIndicators.valid.message}
          icon={validationIndicators.valid.icon}
          color={validationIndicators.valid.color}
        />
      )}
      {isValidSleep === false && (
        <ValidationFeedback
          isValid={false}
          message={validationIndicators.invalid.message}
          icon={validationIndicators.invalid.icon}
          color={validationIndicators.invalid.color}
        />
      )}
    </div>
  );
}
```

### Step 5: Add Stress Indicator to Insights

**Example: Update InsightsCard.jsx**

```jsx
import { StressIndicatorBadge, InfoCard } from './VisualComponents';
import { stressIndicator } from '../utils/visualHints';

export function InsightsCard({ insights, t }) {
  const stressData = stressIndicator(insights.stress_score);

  return (
    <div className="insights-card">
      <StressIndicatorBadge
        stressScore={insights.stress_score}
        emoji={stressData.emoji}
        label={stressData.label}
        color={stressData.color}
      />

      <InfoCard
        icon="💡"
        title="Quick Tip"
        content="Focus on the recommendation that resonates most with you first"
        color="#a9b0ff"
      />

      {/* Rest of insights */}
    </div>
  );
}
```

### Step 6: Add to Global CSS

Add visual feedback to your existing components. Update `global.css`:

```css
/* Add visual indicators to form inputs */
input:valid {
  border-color: #cbe56b;
  box-shadow: 0 0 0 3px rgba(203, 229, 107, 0.1);
}

input:invalid {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

/* Metric status badges */
.metric-status {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  opacity: 0.9;
}

/* Help icon hover */
.help-icon {
  cursor: help;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.help-icon:hover {
  opacity: 1;
}
```

---

## 🎓 Feature Breakdown

### 1. Emoji-Based Status System

Every metric shows status as emoji instead of just numbers:

| Health Metric | Emoji | Range | Status |
|---|---|---|---|
| Sleep | 😴 | 7-8 hours | ✅ Perfect / ⚠️ Low / ❌ Very low |
| Screen Time | 📱 | <4 hours | ✅ Good / ⚠️ High / ❌ Very high |
| Steps | 👟 | 8000-10000 | ✅ Good / ⚠️ Low / 🔥 Excellent |
| Stress | 😊-😰 | 0-3.5 | Visual emoji scale |

### 2. Interactive Tour (First-Time Users)

**What happens:**
1. First time users see a guided tour
2. Tour shows each major feature with simple explanations
3. Tour can be skipped at any time
4. Story saved in localStorage so it only shows once

**Customizing the tour:**
Edit `frontend/src/utils/guidedTour.js` and modify the `tourSteps` array.

### 3. Persistent Tooltips

**What shows:**
- Hover over any metric → see helpful tip
- Hover over form field → see examples
- Click info icons → see more details

**Making tooltips work:**
Wrap components with `<VisualTooltip>` component.

### 4. Form Validation Feedback

**What shows:**
- Green checkmark ✅ = Good input
- Red X ❌ = Invalid input
- Orange warning ⚠️ = Be careful
- Blue info ℹ️ = Helpful hint

**When shown:**
- When user types in form field
- Real-time validation feedback
- Clear examples provided up front

### 5. Interactive Progress Bars

**What shows:**
- Visual bar filling up as user reaches goals
- Emoji encouragement (🚀 → 👍 → 💪 → 🔥)
- Percentage complete

---

## 🌐 Multi-Language Support

The system already supports 4 languages. Simple translations are stored in `utils/i18n.js`.

Add visual hints in all languages:

```js
// In visualHints.js, expand each indicator with translations
export const healthIndicators = {
  sleep: {
    icon: "😴",
    labels: {
      en: "Sleep Hours",
      hi: "नींद के घंटे",
      te: "నిద్ర గంటలు",
      ta: "தூக்க மணிநேரம்",
    },
    // ... rest of config
  }
}
```

Then in components, use the translated label:

```jsx
<FormHint
  label={inputHints.sleep_hours.labels[language]}
/>
```

---

## 📦 Package Dependencies

Add to `frontend/package.json`:

```json
{
  "dependencies": {
    "joyride": "^2.7.2"
  }
}
```

Install with:
```bash
npm install --prefix frontend
```

---

## 🧪 Testing Your Implementation

### Test Tour:
```bash
# Open browser console and run:
localStorage.removeItem('habitlens-tour-completed')
# Reload page - tour should show again
```

### Test Validation:
1. Open form
2. Type invalid values
3. Should show red ❌ feedback
4. Hover over icon → see help text

### Test Tooltips:
1. Hover over each metric
2. Should see emoji + helpful text
3. Works on mobile (tap to show)

---

## 🎯 Best Practices for Low-Literacy Users

### 1. Minimize Text
- Use icons instead of words
- Keep labels under 3 words
- Use simple, everyday language
- Avoid technical jargon

### 2. Use Color & Emoji
- Different colors for different states
- Emoji for quick recognition
- Consistent icons throughout
- Clear visual hierarchy

### 3. Provide Examples
- Show "good" vs "bad" values
- Give concrete numbers
- Use familiar comparisons
- Guide step-by-step

### 4. Make it Interactive
- Hover/tap for more info
- Visual feedback on input
- Progress indicators
- Celebrate achievements

### 5. Support Multiple Senses
- Visual (icons, colors, emoji)
- Textual (simple labels)
- Interactive (hover, click)
- Motivational (feedback, encouragement)

---

## 🔄 Continuous Improvement

Monitor usage with:

1. **Tour Completion Rate**
   ```js
   // In analytics
   if (hasTourBeenCompleted()) {
     analytics.track('tour_completed');
   }
   ```

2. **Form Error Feedback**
   ```js
   // Track which fields cause most errors
   analytics.track('validation_error', { field: 'sleep_hours' });
   ```

3. **User Behavior**
   - Which metrics do users check most?
   - Where do they spend most time?
   - Which recommendations do they follow?

Use this data to improve the UI further.

---

## 🆘 Support & Troubleshooting

### Tour not showing on first visit?
- Check localStorage: `localStorage.getItem('habitlens-tour-completed')`
- If `'true'`, reset with: `localStorage.removeItem('habitlens-tour-completed')`

### Tooltips not appearing?
- Ensure `VisualComponents.jsx` is imported
- Check CSS file is loaded: `visualComponents.css`
- Verify wrapping component has class name

### Validation not working?
- Check input `type` is numeric
- Verify `min` and `max` attributes
- Test with console: `document.querySelector('input').validity`

---

## 📚 File Reference

| File | Purpose | Location |
|---|---|---|
| `guidedTour.js` | Tour configuration | `frontend/src/utils/` |
| `visualHints.js` | Status indicators | `frontend/src/utils/` |
| `VisualComponents.jsx` | Reusable components | `frontend/src/components/` |
| `visualComponents.css` | Component styling | `frontend/src/styles/` |

---

## 🎉 Next Steps

1. **Install Joyride:** `npm install joyride --prefix frontend`
2. **Update DashboardPage.jsx** with tour integration
3. **Wrap components** with `<VisualTooltip>` and visual components
4. **Test tour** by clearing localStorage and reloading
5. **Customize tour steps** as needed
6. **Add translations** for other languages
7. **Monitor usage** and iterate

---

**Created for HabitLens v2.0 - Accessibility Initiative** 🌍⚡
