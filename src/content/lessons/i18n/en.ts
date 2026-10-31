import type { LessonTranslations } from "./types";

const en: LessonTranslations = {
  "primo-taglio": {
    title: "The first cut",
    summary: "Timeline, Razor tool and ripple delete.",
    steps: [
      { kind: "theory", title: "Sequence and timeline", body: [
        "In Premiere Pro you edit inside a **sequence**: a container with precise settings (resolution, frame rate) where you arrange clips over time.",
        "The **timeline** is the sequence seen up close: left to right is time, top to bottom are the **tracks**. V1, V2… for video, A1, A2… for audio.",
        "The vertical blue line is the **playhead**: the frame it touches is the one you see in the **Program Monitor**.",
      ], terms: [
        { term: "Timecode", def: "00:00:04:12 = hours : minutes : seconds : frames" },
        { term: "25 fps", def: "25 frames per second, the European standard (PAL)" },
      ] },
      { kind: "theory", title: "Two tools, two keys", body: [
        "The **Selection tool (V)** lets you choose clips: click and the clip highlights.",
        "The **Razor tool (C)** splits a clip in two at the point you click. It doesn't delete anything: it only creates a new edit point.",
      ], tip: "Pro editors never pick tools with the mouse. Learn shortcuts from day one: they'll save you hours." },
      { kind: "quiz", question: "Which key activates the Razor tool in Premiere Pro?", options: ["V", "C", "R", "B"], explanation: "C as in \"Cut\". V switches back to the Selection tool." },
      { kind: "editor", title: "Cut at the markers", instructions: "There's a blooper between the two **yellow markers** in the interview. Press **C** for the Razor and cut the clip on **both** markers. Try Space to play." },
      { kind: "quiz", question: "You've isolated the blooper. How do you remove it without leaving a black gap in the timeline?", options: ["Delete", "Shift + Delete (Ripple Delete)", "Ctrl + Z", "C (Razor)"], explanation: "Ripple Delete removes the clip and shifts everything after it to the left, closing the gap." },
      { kind: "editor", title: "Delete the blooper", instructions: "With the **Selection tool (V)** click the piece between the markers, then press **Shift + Delete** to ripple delete it." },
    ],
  },

  "crea-sequenza": {
    title: "Create your first sequence",
    summary: "The New Sequence window, just like in Premiere.",
    steps: [
      { kind: "theory", title: "First things first: the sequence", body: [
        "Every edit in Premiere lives inside a **sequence**. You create one from **File → New → Sequence** or with **Ctrl+N**.",
        "The two most important settings are: the **frame size** (e.g. 1920×1080, Full HD) and the **timebase**, i.e. frames per second (fps).",
        "In Europe the standard is **25 fps**. For vertical social media you use **1080×1920**.",
      ], terms: [{ term: "1920×1080", def: "Horizontal Full HD (16:9)" }, { term: "25 fps", def: "European standard (PAL)" }] },
      { kind: "theory", title: "Preset or custom", body: [
        "In the **Sequence Presets** tab you'll find ready-made settings, organized by camera: for example *Digital SLR → 1080p → DSLR 1080p25*.",
        "If you need a custom size, go to the **Settings** tab and choose **Editing Mode: Custom**: only then can you manually type width and height.",
      ], tip: "Pro trick: drag a clip onto the New Item button in the Project panel and Premiere creates a sequence matching the video's settings." },
      { kind: "premiere", title: "Create the sequence", instructions: "Create a **1920×1080 at 25 fps** sequence and name it **My first edit**. You can explore all tabs and change whatever you want: only the result matters. Then press **OK**." },
      { kind: "quiz", question: "Which shortcut opens the New Sequence window?", options: ["Ctrl+N", "Ctrl+M", "Ctrl+K", "Ctrl+D"], explanation: "N for New. Ctrl+M opens the export instead." },
      { kind: "quiz", question: "You want to manually type an unusual size (e.g. 1080×1350). What must you do first?", options: ["Choose Editing Mode: Custom", "Change the audio sample rate", "Add video tracks", "Nothing, you always can"], explanation: "With a preset the size is locked: you need Custom." },
    ],
  },
  "importare": {
    title: "Importing and organizing",
    summary: "Bins, labels and a tidy project.",
    steps: [
      { kind: "theory", title: "Before editing, get organized", body: [
        "Everything you use (video, audio, images) goes into the **Project** panel. Import with **Ctrl+I** or by dragging files in.",
        "**Bins** are the project's folders. Create one with **Ctrl+B** and sort your material: *Video*, *Audio*, *Music*, *Graphics*.",
        "Premiere doesn't copy files: it **links** them. If you move or rename a file on disk, the project loses it and marks it *offline*.",
      ], tip: "Create a folder for each project on disk, with the same subfolders as the bins. It'll save you from many \"missing file\" headaches." },
      { kind: "quiz", question: "Which shortcut imports a file into Premiere?", options: ["Ctrl+I", "Ctrl+M", "Ctrl+K", "Ctrl+B"], explanation: "I for Import. Ctrl+B creates a bin, Ctrl+M opens the export." },
      { kind: "theory", title: "Labels and names", body: [
        "Every clip has a **color label**: you can use it to quickly identify interviews, B-roll or music in the timeline at a glance.",
        "Renaming clips in the project (e.g. *Interview_Marco_1*) doesn't change the file on disk: it's just a handy name for you.",
      ] },
      { kind: "quiz", question: "You moved the video folder to another drive. What happens in the project?", options: ["Nothing, Premiere copies files", "The clips go offline until you relink them", "The project is deleted", "Videos become audio"], explanation: "Premiere links files: if they move, use \"Relink Media\"." },
      { kind: "match", title: "Match each item to its purpose", pairs: [
        ["Bin", "Project folder"],
        ["Ctrl+I", "Import files"],
        ["Label", "Clip color"],
        ["Offline", "File not found"],
      ] },
    ],
  },
  "monitor": {
    title: "Source and program monitors",
    summary: "What the two monitors show.",
    steps: [
      { kind: "theory", title: "Two screens, two jobs", body: [
        "The **Source Monitor** (Shift+2) shows a clip **before** it enters the timeline: you watch it there and choose the part you need.",
        "The **Program Monitor** (Shift+4) shows the **result of your edit**: what's in the timeline under the playhead.",
        "Double-click a clip in the project and it opens in the Source Monitor.",
      ] },
      { kind: "quiz", question: "You want to see the final result of your edit. Which monitor do you look at?", options: ["Source", "Program", "Lumetri", "Audio"], explanation: "The Program Monitor shows what's in the timeline." },
      { kind: "theory", title: "Playing like the pros", body: [
        "**Space** starts and stops playback. **←** and **→** move one frame backward and forward.",
        "The blue **timecode** at the bottom left tells you where you are: *hours:minutes:seconds:frames*.",
      ] },
      { kind: "quiz", question: "The timecode 00:01:10:12 means...", options: ["1 hour, 10 minutes and 12 seconds", "1 minute, 10 seconds and 12 frames", "110 frames", "12 minutes"], explanation: "The last number is frames, not hundredths." },
      { kind: "match", title: "Match", pairs: [
        ["Source Monitor", "Clip before editing"],
        ["Program Monitor", "Timeline result"],
        ["Space", "Play / pause"],
        ["→", "One frame forward"],
      ] },
    ],
  },
  "in-out": {
    title: "In and Out points",
    summary: "Marking I and O to take only what you need.",
    steps: [
      { kind: "theory", title: "Take only the good part", body: [
        "In the Source Monitor you mark the **In point** (start) with **I** and the **Out point** (end) with **O**.",
        "When you bring the clip to the timeline, only the part between I and O enters: no useless bits to trim afterwards.",
        "To clear the points: **Ctrl+Shift+X** removes both.",
      ], terms: [{ term: "I (In)", def: "In point: where the clip starts" }, { term: "O (Out)", def: "Out point: where the clip ends" }] },
      { kind: "quiz", question: "Which key marks the Out point?", options: ["I", "O", "S", "X"], explanation: "O for Out: where the clip ends." },
      { kind: "quiz", question: "What are In and Out points for?", options: ["To color the clip", "To bring only the part you need into the timeline", "To export the video", "To raise the volume"], explanation: "You select the right piece in advance and keep the timeline clean." },
      { kind: "theory", title: "Also in the timeline", body: [
        "I and O also work in the timeline: they mark a zone of the sequence, useful for exporting just a part or replacing a section.",
      ], tip: "Try watching the clip with J, K, L and pressing I and O while it plays: it's super fast." },
      { kind: "match", title: "Match", pairs: [
        ["I", "In point"],
        ["O", "Out point"],
        ["Ctrl+Shift+X", "Clear I and O"],
        ["Source Monitor", "Where you usually set them"],
      ] },
    ],
  },
  "inserisci-sovrascrivi": {
    title: "Insert and Overwrite",
    summary: "The two ways to bring clips into the timeline.",
    steps: [
      { kind: "theory", title: "Two ways to add a clip", body: [
        "**Insert** (key **,** comma): the clip enters at the playhead and **pushes forward** everything after it. Nothing is deleted.",
        "**Overwrite** (key **.** period): the clip enters and **covers** what's underneath, for its duration. The total length doesn't change.",
      ] },
      { kind: "quiz", question: "You want to add a clip in the middle without deleting anything. What do you use?", options: ["Overwrite (.)", "Insert (,)", "Razor (C)", "Delete"], explanation: "Insert pushes the rest of the edit forward." },
      { kind: "quiz", question: "You overwrite a 3-second clip on top of a 60-second edit. How long is the sequence now?", options: ["63 seconds", "60 seconds", "57 seconds", "3 seconds"], explanation: "Overwrite covers what's underneath: the duration doesn't change." },
      { kind: "theory", title: "Target tracks", body: [
        "On the left side of the timeline there are the **V1, A1**… buttons highlighted: they indicate which track the clip will go to when you use comma or period.",
      ] },
      { kind: "match", title: "Match", pairs: [
        [",", "Insert"],
        [".", "Overwrite"],
        ["Insert", "Pushes the rest forward"],
        ["Overwrite", "Covers what's underneath"],
      ] },
    ],
  },
  "trim": {
    title: "Trimming clips",
    summary: "Shortening and extending a clip from its edge.",
    steps: [
      { kind: "theory", title: "The trim", body: [
        "Trimming means **moving the start or end** of a clip by dragging its edge with the Selection tool (V).",
        "If you shorten a clip with the Selection tool, a **gap** remains. If you hold **Ctrl** while dragging, it becomes a ripple trim and the gap closes automatically.",
      ] },
      { kind: "quiz", question: "You shorten the end of a clip with the Selection tool. What remains in the timeline?", options: ["A gap after the clip", "Nothing, it closes by itself", "A transition", "A marker"], explanation: "With the plain Selection tool the gap stays: hold Ctrl for ripple." },
      { kind: "theory", title: "Q and W: the pro trick", body: [
        "Place the playhead where you want to cut and press **Q**: it removes everything from the start of the clip to the playhead and closes the gap.",
        "**W** removes from the playhead to the end of the clip. It's the fastest way to trim.",
      ] },
      { kind: "quiz", question: "You want to remove everything AFTER the playhead to the end of the clip, with no gaps. Which key?", options: ["Q", "W", "C", "V"], explanation: "W trims the end of the clip to the playhead." },
      { kind: "match", title: "Match", pairs: [
        ["Trim", "Moving the edge of a clip"],
        ["Q", "Trim start to playhead"],
        ["W", "Trim end from playhead"],
        ["Ctrl + drag", "Ripple trim"],
      ] },
    ],
  },
  "ripple-roll": {
    title: "Ripple and Roll edit",
    summary: "Moving an edit point without creating gaps.",
    steps: [
      { kind: "theory", title: "Two precision tools", body: [
        "**Ripple Edit (B)**: extends or shortens a clip and **shifts everything else** accordingly. No gaps ever.",
        "**Rolling Edit (N)**: moves the **edit point** between two clips: one gets longer, the other shorter. Total duration stays the same.",
      ] },
      { kind: "quiz", question: "You want to move the edit point between two clips without changing total duration. Which tool?", options: ["Ripple Edit (B)", "Rolling Edit (N)", "Razor (C)", "Slip (Y)"], explanation: "Rolling Edit shortens one clip and extends the other by the same amount." },
      { kind: "editor", title: "Remove the blooper without gaps", instructions: "The same ripple principle works for deleting: select the piece between the markers with **V** and press **Shift + Delete**." },
      { kind: "quiz", question: "With Ripple Edit you shorten a clip by 2 seconds. What happens?", options: ["A 2-second gap remains", "Everything after shifts back by 2 seconds", "The volume changes", "Nothing"], explanation: "The ripple shifts the rest and leaves no gaps." },
      { kind: "match", title: "Match", pairs: [
        ["B", "Ripple Edit"],
        ["N", "Rolling Edit"],
        ["Shift+Delete", "Ripple Delete"],
        ["Rolling", "Total duration unchanged"],
      ] },
    ],
  },
  "slip-slide": {
    title: "Slip and Slide",
    summary: "Changing the content or position of a clip.",
    steps: [
      { kind: "theory", title: "Slip (Y)", body: [
        "**Slip** changes **which part** of the clip is shown, without changing its position or duration in the timeline. Like sliding film through a fixed window.",
        "Perfect when the cut is right but you want the action to start a moment earlier or later.",
      ] },
      { kind: "quiz", question: "A clip is in the right place and right duration, but you want to show a slightly different moment. What do you use?", options: ["Slide (U)", "Slip (Y)", "Razor (C)", "Insert"], explanation: "Slip changes the content shown, not the position." },
      { kind: "theory", title: "Slide (U)", body: [
        "**Slide** moves a clip **along the timeline** between its neighbors: the one before gets longer and the one after gets shorter (or vice versa). The moved clip stays identical.",
      ] },
      { kind: "quiz", question: "With Slide you move a clip forward. What happens to the neighboring clips?", options: ["They're deleted", "One gets longer and the other shorter", "They stay the same and a gap appears", "They become audio"], explanation: "Slide compensates with the adjacent clips: no gaps." },
      { kind: "match", title: "Match", pairs: [
        ["Y", "Slip"],
        ["U", "Slide"],
        ["Slip", "Changes what you see"],
        ["Slide", "Changes where the clip is"],
      ] },
    ],
  },
  "snapping-marker": {
    title: "Snapping and markers",
    summary: "Snapping cuts to the right points.",
    steps: [
      { kind: "theory", title: "Snapping", body: [
        "With **snapping** on (key **S**), clips, cuts and the playhead **snap** to edges, markers and the playhead when you pass close. No one-frame gaps.",
        "**Markers** (key **M**) are colored bookmarks: they mark a music beat, a cue, a cut point.",
      ] },
      { kind: "quiz", question: "Which key adds a marker?", options: ["K", "M", "S", "N"], explanation: "M for Marker. S toggles snapping on and off." },
      { kind: "editor", title: "Cut at the markers", instructions: "Use snapping: press **C** and pass close to the **yellow markers**, the cut will snap by itself. Cut at both." },
      { kind: "quiz", question: "Why is snapping useful?", options: ["Colors the clips", "Avoids small gaps or overlaps between clips", "Exports faster", "Raises the volume"], explanation: "By snapping edges, cuts align to the frame." },
      { kind: "match", title: "Match", pairs: [
        ["S", "Snapping on/off"],
        ["M", "Add marker"],
        ["Marker", "Colored bookmark"],
        ["Snapping", "Snap to edges"],
      ] },
    ],
  },
  "scorciatoie": {
    title: "Pro shortcuts",
    summary: "J, K, L and the keys that save hours.",
    steps: [
      { kind: "theory", title: "J, K, L", body: [
        "**L** plays forward, **J** plays backward, **K** pauses. Pressing L or J multiple times speeds up (2x, 4x…).",
        "Hold **K** and press **L** or **J** to move in slow motion: perfect for finding the exact frame.",
      ] },
      { kind: "quiz", question: "You press L twice. What happens?", options: ["Pause", "Backward playback", "Forward playback at double speed", "Export opens"], explanation: "Each press of L increases the speed." },
      { kind: "theory", title: "Other must-know shortcuts", body: [
        "**Ctrl+K**: cuts all selected clips (or active tracks) at the playhead, without changing tools.",
        "**+** and **−**: zoom the timeline. **\\**: fit the sequence to the window.",
        "**Ctrl+Z**: undo. **Up/Down arrow**: jump to the previous or next edit point.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["J", "Backward"],
        ["K", "Pause"],
        ["L", "Forward"],
        ["Ctrl+K", "Cut at playhead"],
        ["\\", "Fit timeline"],
      ] },
      { kind: "quiz", question: "You want to cut at the playhead without picking up the Razor. Which shortcut?", options: ["Ctrl+K", "Ctrl+M", "Ctrl+I", "Ctrl+D"], explanation: "Ctrl+K adds an edit point where the playhead is." },
    ],
  },
  "livelli-db": {
    title: "Levels and decibels",
    summary: "Reading VU meters and staying under 0 dB.",
    steps: [
      { kind: "theory", title: "Audio meters", body: [
        "Beside the timeline you'll find the **audio meters**: bars that rise with volume. They measure in **decibels (dBFS)**, where **0 dB is the maximum**.",
        "If you hit 0 dB the sound **distorts** (clipping): the meter turns red and the damage can't be repaired.",
      ], terms: [{ term: "0 dBFS", def: "The ceiling: never exceed it" }, { term: "Clipping", def: "Distortion when exceeding the maximum" }] },
      { kind: "quiz", question: "Where should the peaks of a speaking voice be?", options: ["Above 0 dB", "Between −12 and −6 dB", "Between −60 and −50 dB", "Always at exactly 0 dB"], explanation: "The voice sits comfortably between −12 and −6: loud and clear but no distortion." },
      { kind: "theory", title: "Clip gain", body: [
        "To raise or lower an entire clip: right-click → **Audio Gain** (key **G**). Or drag the volume line inside the clip.",
        "**Music under the voice** should be much lower: usually between −24 and −18 dB.",
      ] },
      { kind: "quiz", question: "The meter turns red at the top. What does it mean?", options: ["Audio is perfect", "There's clipping: the sound distorts", "Audio is in mono", "The clip is offline"], explanation: "Red at the top = exceeded 0 dB: lower the volume." },
      { kind: "match", title: "Match", pairs: [
        ["0 dB", "Maximum volume"],
        ["−12 / −6 dB", "Speaking voice"],
        ["−24 / −18 dB", "Music under voice"],
        ["G", "Audio Gain"],
      ] },
    ],
  },
  "keyframe-volume": {
    title: "Volume keyframes",
    summary: "Raising and lowering music at the right moment.",
    steps: [
      { kind: "theory", title: "Volume that changes over time", body: [
        "Inside every audio clip there's a **volume line**. To make it change you need **keyframes**: points that lock a value at a specific moment.",
        "With **Ctrl+click** on the line you add a keyframe (or use the Pen tool, **P**). Two keyframes at different values create a ramp.",
      ] },
      { kind: "quiz", question: "How many keyframes are needed, minimum, to make the volume rise or fall?", options: ["1", "2", "4", "None"], explanation: "A start point and an end point: Premiere creates the ramp between them." },
      { kind: "theory", title: "Quick audio fades", body: [
        "To fade in the music: one keyframe at the start very low and one after 1–2 seconds at normal volume.",
        "Alternatively, drag the **Constant Power** transition (Ctrl+Shift+D) to the start or end of the clip.",
      ] },
      { kind: "quiz", question: "How do you add a keyframe on the volume line?", options: ["Double-click the clip", "Ctrl + click on the line", "Key M", "Key Delete"], explanation: "Ctrl+click creates a point on the line; then drag it up or down." },
      { kind: "match", title: "Match", pairs: [
        ["Keyframe", "Value locked at a moment"],
        ["Ctrl+click", "Adds a keyframe"],
        ["P", "Pen tool"],
        ["Constant Power", "Audio fade"],
      ] },
    ],
  },
  "ducking": {
    title: "Music under the voice",
    summary: "Ducking to make every word clear.",
    steps: [
      { kind: "theory", title: "What is ducking", body: [
        "When someone speaks, the music must **lower** and rise again during pauses. This is called **ducking**.",
        "You can do it manually with keyframes, or automatically: **Essential Sound** panel, set the voice as *Dialogue* and the music as *Music*, then enable **Ducking** and click *Generate Keyframes*.",
      ] },
      { kind: "quiz", question: "In the Essential Sound panel, what type do you assign to the voice track?", options: ["Music", "Dialogue", "SFX", "Ambience"], explanation: "Dialogue: so Premiere knows which track should stay in the foreground." },
      { kind: "quiz", question: "What volume should music be under the spoken voice?", options: ["Louder than the voice", "Same as the voice", "Around −24 to −18 dB", "At 0 dB"], explanation: "It should accompany, not cover: much lower than the voice." },
      { kind: "theory", title: "The final touch", body: [
        "Automatic ducking is a great start, but listen again: it often helps to move the dip a few frames before the person starts speaking.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["Ducking", "Music that lowers under the voice"],
        ["Dialogue", "Type for the voice"],
        ["Music", "Type for the soundtrack"],
        ["Generate Keyframes", "Automatic ducking"],
      ] },
    ],
  },
  "rumore": {
    title: "Cleaning up noise",
    summary: "Reducing hums and hiss.",
    steps: [
      { kind: "theory", title: "Most common noises", body: [
        "**Hiss** (white noise), **electrical hum** at 50 Hz, **rumble** from an empty room: these are the most frequent audio defects.",
        "In **Essential Sound → Dialogue → Repair** you'll find *Reduce Noise*, *Reduce Rumble*, *DeHum* and *DeEss* (for harsh S sounds).",
      ] },
      { kind: "quiz", question: "You hear a constant electrical hum under the voice. Which option do you use?", options: ["Reduce Rumble", "DeHum", "Ducking", "DeEss"], explanation: "The 50 Hz hum is removed with DeHum." },
      { kind: "theory", title: "Don't overdo it", body: [
        "Pushing noise reduction too hard makes the voice sound **metallic**, like underwater. A bit of hiss is better than a robotic voice.",
      ], tip: "The best trick is always recording well: microphone close to the mouth and a room with curtains, sofas and rugs." },
      { kind: "quiz", question: "You maxed out noise reduction and the voice sounds metallic. What do you do?", options: ["Leave it", "Lower the effect intensity", "Raise the volume", "Add louder music"], explanation: "Less reduction and a natural voice is better." },
      { kind: "match", title: "Match", pairs: [
        ["Reduce Noise", "Background hiss"],
        ["DeHum", "Electrical hum"],
        ["Reduce Rumble", "Room echo"],
        ["DeEss", "Harsh S sounds"],
      ] },
    ],
  },
  "sfx": {
    title: "Sound effects",
    summary: "Whooshes, impacts and atmospheres that add rhythm.",
    steps: [
      { kind: "theory", title: "The sound you don't notice (but feel)", body: [
        "**Sound effects** (SFX) make an edit come alive: a **whoosh** on a fast transition, an **impact** on a title, a **click** on an animation.",
        "**Ambience** (room tone) is the background sound of a place: keeping it under cuts avoids unnatural \"holes\" of silence.",
      ] },
      { kind: "quiz", question: "What's room tone for?", options: ["To cover the voice", "To avoid unnatural silences between cuts", "To distort the audio", "To replace the music"], explanation: "A subtle continuous ambience makes cuts invisible." },
      { kind: "quiz", question: "A title snaps onto screen. Which sound effect fits best?", options: ["Continuous rain", "A brief impact or whoosh", "A full song", "Never any sound"], explanation: "Brief effects emphasize the action." },
      { kind: "theory", title: "Use them sparingly", body: [
        "SFX should **accompany**: keep them lower than the voice and don't put one on every cut, or they become annoying.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["Whoosh", "Fast transition"],
        ["Impact", "Title entering"],
        ["Room tone", "Background ambience"],
        ["SFX", "Sound effects"],
      ] },
    ],
  },
  "taglio-netto": {
    title: "The straight cut",
    summary: "Why 90% of transitions are a simple cut.",
    steps: [
      { kind: "theory", title: "The world's most used transition", body: [
        "The **straight cut** goes from one shot to the next with no effects. It's what you see in almost every professional film and video.",
        "A good cut is **invisible**: it happens on a movement, a glance or a sound, and the viewer doesn't notice it.",
      ] },
      { kind: "quiz", question: "What's the most used transition in professional editing?", options: ["Star dissolve", "The straight cut", "Wipe", "3D zoom"], explanation: "Simple, fast and invisible." },
      { kind: "editor", title: "Cut on the action", instructions: "Cut the clip at the two **yellow markers** with the **Razor (C)**: those are the right spots for a clean cut." },
      { kind: "quiz", question: "When does a cut look \"invisible\"?", options: ["When it happens on a movement or a glance", "When it lasts 10 seconds", "When there's a zoom", "Never"], explanation: "Movement guides the eye and the cut vanishes." },
    ],
  },
  "dissolvenza": {
    title: "Cross dissolve",
    summary: "Applying and dosing a cross dissolve.",
    steps: [
      { kind: "theory", title: "Cross dissolve", body: [
        "The **cross dissolve** blends the end of one clip with the beginning of the next. It communicates **time passing** or a soft change of location.",
        "Select the edit point and press **Ctrl+D** to apply the default video transition. For audio: **Ctrl+Shift+D**.",
      ] },
      { kind: "quiz", question: "What does a cross dissolve usually communicate?", options: ["An explosion", "The passing of time or a soft change", "An error", "A freeze frame"], explanation: "It's the classic \"some time later\"." },
      { kind: "theory", title: "Handles", body: [
        "To blend two clips you need extra frames beyond the edit point: these are called **handles**. If a clip ends exactly at the cut, Premiere repeats the last frame.",
        "Typical duration: **12 to 25 frames** (half a second to one second).",
      ] },
      { kind: "quiz", question: "Which shortcut applies the default video transition?", options: ["Ctrl+D", "Ctrl+K", "Ctrl+M", "Ctrl+I"], explanation: "D for Dissolve." },
      { kind: "match", title: "Match", pairs: [
        ["Ctrl+D", "Video transition"],
        ["Ctrl+Shift+D", "Audio transition"],
        ["Handles", "Frames beyond the cut"],
        ["25 frames", "About one second"],
      ] },
    ],
  },
  "dissolvenza-nero": {
    title: "Fade to black",
    summary: "Opening and closing a video with elegance.",
    steps: [
      { kind: "theory", title: "Fade in and fade out", body: [
        "The **fade to black** (*Dip to Black*) makes the image disappear into black. At the start of the video it's called *fade in*, at the end *fade out*.",
        "Used to open and close a video or to separate two very different chapters.",
      ] },
      { kind: "quiz", question: "Where is a fade to black most often used?", options: ["Between every clip", "At the beginning and end of the video", "Only on titles", "Never in professional videos"], explanation: "Opens and closes the story with elegance." },
      { kind: "theory", title: "Together with audio", body: [
        "When the image fades to black, the audio should **fade out** too: put a *Constant Power* transition on the last audio clip, same duration.",
      ] },
      { kind: "quiz", question: "The image fades to black but the music cuts off abruptly. What's missing?", options: ["An audio fade", "A marker", "A straight cut", "A freeze frame"], explanation: "Video and audio should fade together." },
      { kind: "match", title: "Match", pairs: [
        ["Fade in", "From black to image"],
        ["Fade out", "From image to black"],
        ["Dip to Black", "Transition name"],
        ["Constant Power", "Audio fade"],
      ] },
    ],
  },
  "j-l-cut": {
    title: "J-cut and L-cut",
    summary: "Anticipating or extending audio across the cut.",
    steps: [
      { kind: "theory", title: "Audio and video that don't cut together", body: [
        "In a **J-cut** the audio of the next clip **arrives before** its video: you hear the new scene while still seeing the old one.",
        "In an **L-cut** it's the opposite: the video changes but the audio of the previous clip **continues** a bit longer.",
        "The names come from the shape the clips make in the timeline: a J and an L.",
      ] },
      { kind: "quiz", question: "You already hear the sound of the sea while still seeing the kitchen. What type of cut is it?", options: ["L-cut", "J-cut", "Jump cut", "Dissolve"], explanation: "The audio of the next scene anticipates the video: J-cut." },
      { kind: "theory", title: "How it's done", body: [
        "Hold **Alt** and drag the edge of just the audio (or just the video): this trims one part without touching the other, even if they're linked.",
      ], tip: "In interviews the L-cut is magic: the voice keeps going while you show B-roll." },
      { kind: "quiz", question: "Which key do you hold to trim just the audio of a linked clip?", options: ["Shift", "Alt", "Ctrl", "Space"], explanation: "Alt temporarily ignores the audio-video link." },
      { kind: "match", title: "Match", pairs: [
        ["J-cut", "Audio arrives first"],
        ["L-cut", "Audio continues after"],
        ["Alt + drag", "Trim only one part"],
        ["Interviews", "Where they're used a lot"],
      ] },
    ],
  },
  "no-transizioni": {
    title: "When NOT to use transitions",
    summary: "Avoiding effects that look amateurish.",
    steps: [
      { kind: "theory", title: "Less is more", body: [
        "Stars, spinning cubes, page turns: flashy transitions make a video look **amateurish** and distract from the story.",
        "Always ask: does this transition **tell something** (time passing, change of location)? If the answer is no, use a cut.",
      ] },
      { kind: "quiz", question: "You're editing an interview. Between answers what do you usually use?", options: ["A 3D cube", "A straight cut (maybe covered by B-roll)", "A star wipe", "A 5-second dissolve"], explanation: "Clean cut: the transition would distract." },
      { kind: "quiz", question: "When does a dissolve make sense?", options: ["On every cut", "To suggest time passing or a change of mood", "To hide errors always", "Never"], explanation: "Transitions should have a purpose." },
      { kind: "theory", title: "The exceptions", body: [
        "In social media videos and music videos, fast transitions (zoom, whip pan) are part of the **style**: they work if they're consistent throughout and synced to the music.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["Straight cut", "Default choice"],
        ["Dissolve", "Time passing"],
        ["Flashy transitions", "Amateurish look"],
        ["Whip pan", "Social media style, on the beat"],
      ] },
    ],
  },
  "keyframe": {
    title: "What is a keyframe",
    summary: "Two points in time and the computer does the rest.",
    steps: [
      { kind: "theory", title: "The key frame", body: [
        "A **keyframe** locks the value of a property (position, scale, opacity, volume…) at a precise moment.",
        "With **two keyframes** at different values, Premiere and After Effects calculate all the frames in between: this is called **interpolation**.",
        "In the **Effect Controls** panel you activate animation by clicking the **stopwatch** next to the property.",
      ] },
      { kind: "quiz", question: "What happens when you click the stopwatch next to a property?", options: ["The value resets", "Animation is activated and the first keyframe is created", "The video exports", "The clip is deleted"], explanation: "The stopwatch turns on animation for that property." },
      { kind: "quiz", question: "Keyframe 1: opacity 0% at 0s. Keyframe 2: opacity 100% at 1s. What do you see at 0.5s?", options: ["0%", "About 50%", "100%", "Black screen"], explanation: "The computer interpolates: halfway, half the value." },
      { kind: "theory", title: "Keyframes are everywhere", body: [
        "You've already used them for volume. The same principles apply to animating titles, zooms, colors and effects.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["Keyframe", "Value at a moment"],
        ["Stopwatch", "Activates animation"],
        ["Interpolation", "Frames calculated in between"],
        ["Effect Controls", "Properties panel"],
      ] },
    ],
  },
  "posizione-scala": {
    title: "Position and scale",
    summary: "The first movement: the slow zoom.",
    steps: [
      { kind: "theory", title: "The slow zoom (Ken Burns effect)", body: [
        "Animating **Scale** from 100 to 110 over a few seconds creates a **slow zoom**: brings still photos and static shots to life.",
        "Animating **Position** pans the image: together with the zoom it creates a smooth \"camera\" movement.",
      ] },
      { kind: "quiz", question: "You want to add motion to a still photo. What do you animate?", options: ["Volume", "Scale and position", "The clip name", "Duration"], explanation: "A slow zoom with a slight pan is the classic Ken Burns." },
      { kind: "theory", title: "Don't go below 100%", body: [
        "If you shrink a video below 100% you see black edges; if you enlarge it too much you lose definition. For a clean zoom stay between **100 and 120%** with Full HD footage.",
      ] },
      { kind: "quiz", question: "You enlarge a Full HD video to 300%. What's the problem?", options: ["It becomes sharper", "It loses definition and gets grainy", "The audio changes", "None"], explanation: "Enlarging invents pixels that don't exist." },
      { kind: "match", title: "Match", pairs: [
        ["Scale", "Zoom"],
        ["Position", "Pan"],
        ["Ken Burns", "Slow zoom on photos"],
        ["Below 100%", "Black edges"],
      ] },
    ],
  },
  "rotazione-opacita": {
    title: "Rotation and opacity",
    summary: "Making elements appear and spin.",
    steps: [
      { kind: "theory", title: "Opacity", body: [
        "**Opacity** goes from 0% (invisible) to 100% (full). Animating it is the simplest way to make a title or logo **appear** or **disappear**.",
      ] },
      { kind: "quiz", question: "A logo should appear gently. What do you animate?", options: ["Rotation from 0 to 360°", "Opacity from 0% to 100%", "Volume", "Scale to 300%"], explanation: "An opacity fade is soft and elegant." },
      { kind: "theory", title: "Rotation and anchor point", body: [
        "**Rotation** spins the element around its **anchor point**. If the point is in the center, it spins on itself; if it's in a corner, it swings like a door.",
      ] },
      { kind: "quiz", question: "You want an element to rotate like a door, around the left edge. What do you move?", options: ["Opacity", "The anchor point", "The clip duration", "Volume"], explanation: "Rotation always happens around the anchor point." },
      { kind: "match", title: "Match", pairs: [
        ["Opacity 0%", "Invisible"],
        ["Opacity 100%", "Full"],
        ["Rotation", "Spins the element"],
        ["Anchor point", "Center of rotation"],
      ] },
    ],
  },
  "interpolazione": {
    title: "Interpolation",
    summary: "Linear, Bézier and Hold.",
    steps: [
      { kind: "theory", title: "How you get from one keyframe to another", body: [
        "**Linear**: constant speed, abrupt start and stop. Looks mechanical.",
        "**Bézier**: you can curve the motion and speed with handles.",
        "**Hold**: the value stays put and then jumps instantly to the next keyframe. Useful for snap effects.",
      ] },
      { kind: "quiz", question: "You want a snap change with no in-between steps. Which interpolation?", options: ["Linear", "Bézier", "Hold", "Easy ease"], explanation: "Hold keeps the value until the next keyframe." },
      { kind: "quiz", question: "A motion with linear interpolation looks...", options: ["Smooth and natural", "Mechanical, with abrupt start and stop", "Invisible", "In slow motion"], explanation: "Constant speed = no natural acceleration." },
      { kind: "theory", title: "Where to change it", body: [
        "In Premiere: right-click the keyframe → **Temporal Interpolation**. In After Effects, Hold keyframes are square-shaped, Bézier ones are round.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["Linear", "Constant speed"],
        ["Bézier", "Curves with handles"],
        ["Hold", "Instant jump"],
        ["Right-click keyframe", "Change interpolation"],
      ] },
    ],
  },
  "easing": {
    title: "Easing",
    summary: "Natural movements with ease in and ease out.",
    steps: [
      { kind: "theory", title: "Accelerate and decelerate", body: [
        "Nothing in nature starts and stops instantly: a car **accelerates** and **brakes**. **Easing** does the same with animations.",
        "**Ease out**: the motion starts slow and speeds up. **Ease in**: it arrives slowing down. Together: **Easy ease** (in After Effects key **F9**).",
      ] },
      { kind: "quiz", question: "Which key applies Easy Ease in After Effects?", options: ["F1", "F9", "F12", "E"], explanation: "F9 smooths both the arrival and departure of the keyframe." },
      { kind: "theory", title: "The Graph Editor", body: [
        "In the **Graph Editor** (Shift+F3 in After Effects) you see the **speed curve**: a bell-shaped curve means slow start, acceleration and soft stop.",
        "Pulling the yellow handles makes the motion more \"elastic\" or more decisive.",
      ], tip: "Look at the Squeak sliding on the curve on the website: that's exactly an easing curve!" },
      { kind: "quiz", question: "A title arrives at the center of the screen gently slowing down. It's...", options: ["Ease in", "Linear", "Hold", "Ease out"], explanation: "Ease in = smooth arrival at the keyframe." },
      { kind: "match", title: "Match", pairs: [
        ["Ease in", "Arrives slowing down"],
        ["Ease out", "Starts slow"],
        ["F9", "Easy Ease"],
        ["Graph Editor", "Speed curve"],
      ] },
    ],
  },
  "codec": {
    title: "Codecs and containers",
    summary: "H.264, H.265, ProRes: the difference.",
    steps: [
      { kind: "theory", title: "Container and codec", body: [
        "The **container** is the \"box\" (the file extension: .mp4, .mov). The **codec** is the way the video is compressed **inside** the box.",
        "**H.264**: the most compatible, perfect for web and social, usually in .mp4. **H.265 (HEVC)**: same quality with lighter files, but less compatible.",
        "**ProRes** and **DNxHR**: huge files but top quality, for working or archiving.",
      ] },
      { kind: "quiz", question: "Which codec do you choose to upload a video anywhere without issues?", options: ["ProRes 4444", "H.264", "Animation", "None"], explanation: "H.264 plays on virtually every device and platform." },
      { kind: "quiz", question: ".mp4 and .mov are...", options: ["Codecs", "Containers", "Resolutions", "Frame rates"], explanation: "They're the boxes: the codec is the content." },
      { kind: "theory", title: "Export with Ctrl+M", body: [
        "In Premiere you open the export with **Ctrl+M**: choose format (codec), preset, name and output folder.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["H.264", "Compatible everywhere"],
        ["H.265", "Lighter files"],
        ["ProRes", "Master quality"],
        ["Ctrl+M", "Export"],
      ] },
    ],
  },
  "bitrate": {
    title: "Bitrate",
    summary: "Quality vs. file size.",
    steps: [
      { kind: "theory", title: "How much data per second", body: [
        "**Bitrate** is the amount of data used for each second of video, in **Mbps** (megabits per second). Higher = better quality but heavier file.",
        "Too low and the video fills with **blocky artifacts**, especially in high-motion scenes.",
      ] },
      { kind: "quiz", question: "Your exported video has blocky artifacts in fast scenes. What do you raise?", options: ["Volume", "Bitrate", "Number of bins", "Opacity"], explanation: "More data per second = fewer artifacts." },
      { kind: "theory", title: "CBR and VBR", body: [
        "**CBR** uses the same bitrate throughout. **VBR** (variable) uses more data where needed (motion) and less where the image is still: more efficient files. With **2 passes** quality improves further, but export is slower.",
      ] },
      { kind: "quiz", question: "Which mode distributes data where they're needed most?", options: ["CBR", "VBR", "Hold", "Linear"], explanation: "Variable bitrate adapts to the scene." },
      { kind: "match", title: "Match", pairs: [
        ["Bitrate", "Data per second"],
        ["Mbps", "Unit of measurement"],
        ["VBR", "Variable bitrate"],
        ["Artifacts", "Bitrate too low"],
      ] },
    ],
  },
  "export-youtube": {
    title: "Export for YouTube",
    summary: "Recommended settings.",
    steps: [
      { kind: "theory", title: "The recipe", body: [
        "Format **H.264**, preset *Match Source - High Bitrate* as a starting point.",
        "Resolution and frame rate **matching the sequence** (e.g. 1920×1080 at 25 fps). Don't change the frame rate on export.",
        "VBR 2-pass bitrate: about **10–16 Mbps** for 1080p, **35–45 Mbps** for 4K.",
      ] },
      { kind: "quiz", question: "The sequence is at 25 fps. At how many fps do you export for YouTube?", options: ["60", "25", "12", "30, always"], explanation: "Keep the same frame rate as the sequence." },
      { kind: "quiz", question: "What bitrate do you use roughly for a 1080p video?", options: ["1 Mbps", "10–16 Mbps", "500 Mbps", "0.1 Mbps"], explanation: "Enough for good quality without huge files." },
      { kind: "premiere", title: "Export for YouTube", instructions: "The sequence is 1920×1080 at 25 fps. Export in **H.264**, same size and fps, bitrate between **10 and 16 Mbps** and audio at **320 kbps**. Tip: try the *YouTube 1080p Full HD* preset. Then press **Export**." },
      { kind: "theory", title: "Audio", body: [
        "Audio **AAC**, 48 kHz, **320 kbps** stereo. Check beforehand that peaks don't exceed 0 dB.",
      ] },
      { kind: "match", title: "Match", pairs: [
        ["H.264", "Format"],
        ["Match Source", "Same resolution and fps"],
        ["AAC 320 kbps", "Audio"],
        ["10–16 Mbps", "1080p bitrate"],
      ] },
    ],
  },
  "export-social": {
    title: "Export for social media",
    summary: "Vertical, square and platform limits.",
    steps: [
      { kind: "theory", title: "The right format", body: [
        "Reels, TikTok and Shorts are **vertical 9:16**: **1080×1920**. The 4:5 format (1080×1350) works well in the Instagram feed.",
        "The sequence should be created **vertical from the start**: exporting a horizontal video as vertical will distort it or add black bars.",
      ] },
      { kind: "quiz", question: "What resolution do you use for a TikTok?", options: ["1920×1080", "1080×1920", "640×480", "4096×2160"], explanation: "Vertical 9:16: 1080 wide, 1920 tall." },
      { kind: "premiere", title: "A vertical sequence", instructions: "Create a sequence for Reels: **1080×1920** at **30 fps**. Remember: to type a custom size you need **Editing Mode: Custom** in the Settings tab." },
      { kind: "theory", title: "Safe zones", body: [
        "On TikTok and Reels, buttons and captions cover the **bottom** and **right** of the screen: keep titles and subtitles in the central area.",
      ] },
      { kind: "quiz", question: "Where should you avoid placing important text in a Reel?", options: ["Center", "Bottom and right side", "Top center", "Anywhere is fine"], explanation: "That's where the app's buttons are." },
      { kind: "match", title: "Match", pairs: [
        ["9:16", "Reels, TikTok, Shorts"],
        ["4:5", "Instagram feed"],
        ["1080×1920", "Vertical Full HD"],
        ["Safe zone", "Away from buttons"],
      ] },
    ],
  },
  "master": {
    title: "Master and delivery",
    summary: "The file to archive forever.",
    steps: [
      { kind: "theory", title: "The master", body: [
        "The **master** is the maximum quality copy of the finished video, e.g. **ProRes 422 HQ** or **DNxHR HQ**. From there you create all the lighter versions (YouTube, social…).",
        "This way, if tomorrow you need a new format, you don't have to reopen and re-export the entire project.",
      ] },
      { kind: "quiz", question: "Why export a ProRes master in addition to the web version?", options: ["Because it weighs less", "To have a maximum quality copy to create other versions from", "Because YouTube requires it", "For louder audio"], explanation: "The master is the original to keep." },
      { kind: "theory", title: "Archiving the project", body: [
        "With **File → Project Manager** you can collect the project and used files into a single folder: perfect for archiving or handing the work to someone else.",
      ], tip: "Give files clear names with date and version: Squeak_Spot_2026-10-25_v3_MASTER.mov" },
      { kind: "quiz", question: "Which feature collects project and media into one folder?", options: ["Project Manager", "Ctrl+K", "Essential Sound", "Lumetri"], explanation: "Project Manager copies (or trims) everything you need." },
      { kind: "match", title: "Match", pairs: [
        ["Master", "Maximum quality copy"],
        ["ProRes 422 HQ", "Master format"],
        ["Project Manager", "Archives everything together"],
        ["_v3", "Version number"],
      ] },
    ],
  },

  // Section 2
  "inquadrature": {
    title: "Shot types",
    summary: "Wide, medium, close-up and when to use them.",
    steps: [
      { kind: "theory", title: "The shot scale", body: [
        "Shots are measured by how much **space** they show around the subject: **extreme wide shot** (landscape), **wide shot**, **full shot**, **medium shot** (from the waist), **medium close-up**, **close-up** (shoulders and face), **extreme close-up** and **detail**.",
        "The wider the shot, the more it tells **where** we are. The tighter, the more it tells **what the character feels**.",
      ], terms: [{ term: "Establishing shot", def: "Opening wide shot that sets the location" }, { term: "Detail", def: "An object or body part filling the screen" }] },
      { kind: "quiz", question: "You want to tell the viewer which city we're in. What shot do you open with?", options: ["A detail", "A wide shot", "An extreme close-up", "A black screen"], explanation: "The wide shot (establishing shot) orients the viewer in space." },
      { kind: "theory", title: "The classic progression", body: [
        "A scene often opens **from wide to tight**: wide shot → medium shot → close-up. The viewer first gets oriented, then gets closer to the emotion.",
        "The **detail** is perfect for covering a cut or emphasizing a gesture: a steaming cup, a trembling hand.",
      ] },
      { kind: "quiz", question: "Which sequence follows the classic progression?", options: ["Close-up → detail → wide shot", "Wide shot → medium shot → close-up", "Detail → detail → detail", "Extreme close-up → extreme wide"], explanation: "Wide to tight: first the place, then the people, then the emotions." },
      { kind: "match", title: "Match the shot to what it tells", pairs: [
        ["Wide shot", "The location"],
        ["Close-up", "The emotion"],
        ["Detail", "An object or gesture"],
        ["Full shot", "The body in action"],
      ] },
      { kind: "studio", title: "Edit from wide to tight", instructions: "Build a small scene on **V1**: **open** with the **Drone_Sea** (wide shot), then the **interview** (close-up) and **close** with the detail **B-roll_Coffee**. No gaps.", hint: "Drag clips from the Project panel to track V1 one after another: with snapping they stick together.", goals: ["Opens with the drone **wide shot**", "Then the **interview**", "Closes with the coffee **detail**", "No gaps"] },
      { kind: "quiz", question: "A detail inserted between two interview pieces mainly serves to…", options: ["Make the video longer", "Cover the cut and add rhythm", "Change the format", "Raise the volume"], explanation: "Classic: the detail hides the jump and adds information." },
    ],
  },
  "regola-180": {
    title: "The 180° rule",
    summary: "Don't confuse the viewer about directions.",
    steps: [
      { kind: "theory", title: "The imaginary line", body: [
        "When two people talk, imagine a **line** between them. As long as the camera stays on **the same side**, one always looks right and the other always looks left.",
        "If the camera **crosses the line**, the characters seem to suddenly swap: the viewer loses orientation.",
      ] },
      { kind: "quiz", question: "What happens if the camera crosses the 180° line?", options: ["Audio goes out of sync", "Characters seem to reverse their gaze direction", "Video turns black and white", "Nothing happens"], explanation: "Who was looking right now looks left: seems like they turned around." },
      { kind: "theory", title: "How to fix it in editing", body: [
        "The honest trick is to insert a shot **on the line** (frontal) or a camera movement that shows the transition.",
        "The emergency fix is to **flip horizontally** (Flip Horizontal effect), being careful about text and logos that would become mirrored.",
      ], tip: "This applies to motion too: a car going left to right must continue that way in the next shot." },
      { kind: "quiz", question: "What problem does horizontal flipping create?", options: ["Text becomes mirrored", "Audio reverses", "Clip slows down", "Frame rate changes"], explanation: "A flipped sign reads backwards: use with care." },
      { kind: "studio", title: "Fix the eye line", instructions: "The two interview shots look in opposite directions: the first was **flipped**. Make them **look the same way** (apply or remove **Flip Horizontal**).", hint: "**Effects → Video Effects → Transform → Flip Horizontal**. To remove: select it in Effect Controls and press **Delete**.", goals: ["Both clips look the same direction"] },
      { kind: "match", title: "Match", pairs: [
        ["180° line", "Axis between two characters"],
        ["Crossing", "Going to the other side"],
        ["Frontal shot", "On the line"],
        ["Flip", "Emergency fix"],
      ] },
    ],
  },
  "continuita": {
    title: "Continuity editing",
    summary: "Match on action and eyeline match.",
    steps: [
      { kind: "theory", title: "The invisible edit", body: [
        "In **continuity editing** the viewer shouldn't notice the cuts. The secret is **match cuts**: on action, on eyeline, on direction.",
        "**Match on action**: you cut *during* a gesture (a hand lifting a cup) and complete it in the next shot. The movement \"carries\" the eye past the cut.",
      ] },
      { kind: "quiz", question: "Where should you cut for a match on action?", options: ["Before the gesture starts", "In the middle of the gesture", "Well after the gesture", "On a still shot"], explanation: "Mid-gesture the eye follows the motion and doesn't notice the cut." },
      { kind: "theory", title: "Eyeline match", body: [
        "A character looks off-screen → cut → we see **what** they're looking at. The viewer connects the two images: that's the **Kuleshov effect**.",
      ], terms: [{ term: "Kuleshov effect", def: "Meaning is created by the juxtaposition of two shots" }] },
      { kind: "quiz", question: "A man looks off-screen, then we see a plate of pasta. The viewer thinks...", options: ["They're two different videos", "The man is hungry", "It's an error", "The video is over"], explanation: "That's the Kuleshov effect: juxtaposition creates meaning." },
      { kind: "studio", title: "Cut on the gesture", instructions: "The city runs too long. Ripple trim it to the **\"Gesture\"** marker (2.5 s) and attach the coffee right after, which continues the movement. No gaps.", hint: "Place the playhead on the marker and press **W**: trims the end of the clip to the playhead and closes the gap.", goals: ["The cut is on the marker (2.5 s)", "Coffee comes right after", "No gaps"] },
      { kind: "match", title: "Match the cut type", pairs: [
        ["Action", "Cut mid-gesture"],
        ["Eyeline", "Who looks → what they see"],
        ["Direction", "Same direction in both shots"],
        ["Kuleshov", "Meaning from juxtaposition"],
      ] },
    ],
  },
  "alternato": {
    title: "Cross-cutting",
    summary: "Two parallel actions building tension.",
    steps: [
      { kind: "theory", title: "Two stories at the same time", body: [
        "**Cross-cutting** (parallel editing) switches back and forth between **two actions happening simultaneously** in different locations.",
        "As the two actions get closer to meeting, the pieces get **shorter**: tension builds.",
      ] },
      { kind: "quiz", question: "In cross-cutting, as tension rises, the shots become…", options: ["Longer", "Shorter", "Black and white", "Always the same"], explanation: "Shortening pieces speeds up the pace and builds anticipation." },
      { kind: "theory", title: "Parallel or cross-cutting?", body: [
        "**Parallel editing** juxtaposes actions even distant in time to create a comparison (past and present). **Cross-cutting** keeps them in the **same time**.",
      ] },
      { kind: "quiz", question: "A bank robbery and the police arriving, at the same time: what type of editing?", options: ["Cross-cutting", "Parallel", "Jump cut", "Long take"], explanation: "Two simultaneous actions converging: cross-cutting." },
      { kind: "studio", title: "Alternate the two actions", instructions: "Right now all the city comes first, then all the sea. Cut and rearrange on **V1** to **alternate**: city → sea → city → sea (at least **4 pieces**), no gaps.", hint: "Cut each clip in half (**C**), then drag pieces holding **Ctrl** to insert them pushing the rest forward.", goals: ["At least **4 pieces** on V1", "City and sea **alternate**", "No gaps"] },
      { kind: "match", title: "Match", pairs: [
        ["Cross-cutting", "Simultaneous actions"],
        ["Parallel", "Comparison across different times"],
        ["Shorter pieces", "More tension"],
        ["Convergence", "The two actions meet"],
      ] },
    ],
  },
  "ritmo": {
    title: "Rhythm and tempo",
    summary: "Cutting to the music and the scene's breath.",
    steps: [
      { kind: "theory", title: "You can feel the rhythm", body: [
        "**Rhythm** is the duration of shots and the moment they change. Long cuts = calm; short cuts = energy.",
        "With music, the most natural cuts fall **on the beats**: eye and ear align.",
      ] },
      { kind: "quiz", question: "A relaxing travel video will usually have…", options: ["Cuts every half second", "Long shots and soft transitions", "Only jump cuts", "No music"], explanation: "Rhythm follows emotion: calm = long shots." },
      { kind: "theory", title: "Markers on the beats", body: [
        "Listen to the music and press **M** at every important beat as it plays: you get a grid of markers to cut on with **snapping** on.",
      ], tip: "Don't cut on EVERY beat: vary (every 2 or 4 beats) to avoid being predictable." },
      { kind: "quiz", question: "How do you quickly mark the music beats?", options: ["Pressing M during playback", "With Ctrl+M", "With Lumetri", "With the Razor"], explanation: "M adds a marker at the playhead position, even during playback." },
      { kind: "studio", title: "Cut on the beats", instructions: "Markers mark the music beats (2, 4, 6 and 8 s). Cut the drone on **at least three** of these markers with the **Razor (C)** and snapping on.", goals: ["At least **3 cuts** on markers"] },
      { kind: "studio", title: "Now add variety", instructions: "Same music, but now edit **four different clips**, each **starting on a marker**. Use city, coffee, sunset and drone.", goals: ["At least **4 different clips** on V1", "Cuts fall on markers"] },
    ],
  },
  "b-roll": {
    title: "B-roll",
    summary: "Covering cuts with supporting footage.",
    steps: [
      { kind: "theory", title: "A-roll and B-roll", body: [
        "**A-roll** is the main footage (the person speaking). **B-roll** is supporting footage: locations, details, actions being discussed.",
        "B-roll goes on **V2**, above the interview: the voice continues underneath and the interview cuts become invisible.",
      ] },
      { kind: "quiz", question: "Where do you usually put B-roll?", options: ["On V1 replacing the interview", "On V2, above the interview", "On A1", "In another sequence"], explanation: "On V2 it covers the image but leaves the voice on A1 intact." },
      { kind: "theory", title: "What to show", body: [
        "The best B-roll **illustrates** what's being said: if the interviewee talks about their café, show the coffee machine. If they talk about the city, the city.",
      ] },
      { kind: "quiz", question: "The interviewee says \"every morning I make coffee\". What B-roll do you pick?", options: ["A drone over the sea", "A coffee cup detail", "A black screen", "Another close-up"], explanation: "B-roll illustrates the words." },
      { kind: "studio", title: "Cover the jump cuts", instructions: "The interview has two visible cuts at **4 s** and **8 s**. Cover them with B-roll on **V2**: the **city** over the 4 s cut and **coffee** over the 8 s cut.", hint: "Drag the city onto track V2 so it starts a bit before the cut and ends a bit after.", goals: ["The cut at **4 s** is covered", "The cut at **8 s** is covered", "The voice stays intact"] },
      { kind: "match", title: "Match", pairs: [
        ["A-roll", "Person speaking"],
        ["B-roll", "Supporting footage"],
        ["V2", "Where B-roll goes"],
        ["A1", "Where the voice stays"],
      ] },
    ],
  },
  "sync-audio": {
    title: "Syncing audio",
    summary: "Merging external audio and video using the waveform.",
    steps: [
      { kind: "theory", title: "Why the audio is separate", body: [
        "On professional sets, audio is recorded with an **external recorder** and better microphones. In the edit it must be **synced** with the video.",
        "The **clapperboard** is for exactly this: the clap creates a sharp peak in the waveform and a precise frame in the video.",
      ] },
      { kind: "quiz", question: "What is the clapperboard clap for?", options: ["To cue the actors", "To create a precise sync point between audio and video", "To measure light", "Nothing, it's tradition"], explanation: "Audio peak + frame of the clap = frame-accurate sync." },
      { kind: "theory", title: "In Premiere", body: [
        "Select video and external audio and use **Clip → Synchronize** (it analyzes the waveforms). Or align the peaks manually and then **link** the clips with **Ctrl+L**.",
      ] },
      { kind: "quiz", question: "After syncing, why link (Ctrl+L) video and audio?", options: ["For faster export", "So they move and cut together without losing sync", "To raise the volume", "To create a transition"], explanation: "Linked clips always stay aligned." },
      { kind: "studio", title: "Manual sync", instructions: "The interview audio on **A1** is offset by 1.2 seconds from the video. Move it until it's **perfectly aligned** with the video (same start), then **link** audio and video with **Ctrl+L**.", hint: "Drag the audio clip to 0 s (snapping helps). Then select both and press **Ctrl+L**.", goals: ["Audio aligned with video", "Audio and video **linked**"] },
      { kind: "match", title: "Match", pairs: [
        ["Clapperboard", "Sync peak"],
        ["Ctrl+L", "Link / unlink"],
        ["Waveform", "Sound drawing"],
        ["Out of sync", "Lips and voice don't match"],
      ] },
    ],
  },
  "multicam": {
    title: "Multicam sequences",
    summary: "Switching between cameras in real time.",
    steps: [
      { kind: "theory", title: "Multiple cameras, one scene", body: [
        "In an interview or concert you shoot with **multiple cameras** simultaneously: camera A wide, camera B tight.",
        "Premiere puts them in a **multicam sequence**: you see all cameras at once and choose which to show by clicking (or pressing 1, 2, 3…) while the video plays.",
      ] },
      { kind: "quiz", question: "In a multicam sequence, how do you switch cameras while the video plays?", options: ["With number keys 1, 2, 3…", "With Ctrl+M", "By renaming clips", "By exporting each camera"], explanation: "Each number corresponds to an angle: it's like live directing." },
      { kind: "theory", title: "The same principle, manually", body: [
        "Without multicam you can stack cameras: **A on V1**, **B on V2**. Where you want camera B, leave the clip on V2; where you want A, cut and remove V2.",
      ], tip: "Switch cameras when the emotion or the sentence changes, not randomly." },
      { kind: "quiz", question: "Camera A on V1, camera B on V2. What does the viewer see where both exist?", options: ["Camera A", "Camera B, because V2 is on top", "A split screen", "Nothing"], explanation: "Higher tracks cover those below." },
      { kind: "studio", title: "Two-camera directing", instructions: "Camera B (tight) is on **V2** for the entire duration. Show **camera B only between 4 and 8 seconds**: cut it and remove the pieces before and after.", hint: "Razor (**C**) on V2 at 4 s and at 8 s, then select the outer pieces and press **Delete** (not ripple!).", goals: ["Camera B visible at **6 s**", "Before 4 s camera A is visible", "After 8 s camera A is visible"] },
      { kind: "match", title: "Match", pairs: [
        ["Camera A", "Wide shot"],
        ["Camera B", "Tight shot"],
        ["Keys 1-2-3", "Camera switch in multicam"],
        ["V2", "Covers V1"],
      ] },
    ],
  },
  "tagliare-intervista": {
    title: "Cutting an interview",
    summary: "Removing pauses and hesitations invisibly.",
    steps: [
      { kind: "theory", title: "Cleaning up speech", body: [
        "A raw interview is full of **\"uhm\"**s, pauses, restarted sentences. Removing them makes the speaker sound more confident and the video faster.",
        "You work by **listening**: cut where a clean sentence ends and resume where the next one starts.",
      ] },
      { kind: "quiz", question: "What's the fastest tool for removing an \"uhm\" without leaving gaps?", options: ["Delete", "Ripple Delete (Shift+Delete)", "Ctrl+M", "Dissolve"], explanation: "Removes the piece and closes the space immediately." },
      { kind: "theory", title: "Covering the jumps", body: [
        "Every cut creates a small **jump** in the image (jump cut). Cover it with **B-roll**, a camera switch, or turn it into a style choice (next lesson).",
      ] },
      { kind: "quiz", question: "After removing an \"uhm\" the image jumps. Which is NOT a good solution?", options: ["Cover with B-roll", "Switch to another camera", "Leave the black gap", "A slight punch-in"], explanation: "The black gap is exactly what you want to avoid!" },
      { kind: "studio", title: "Remove the \"uhm\"s", instructions: "Markers mark two hesitations: **3–4 s** and **9–10.5 s**. Remove both with **Ripple Delete**: the speech should flow without gaps.", goals: ["First hesitation (3–4 s) removed", "Second hesitation (9–10.5 s) removed", "No gaps", "Duration about **11.5 s**"] },
      { kind: "match", title: "Match", pairs: [
        ["Uhm", "Hesitation to remove"],
        ["Shift+Delete", "Ripple Delete"],
        ["Jump cut", "Image jump"],
        ["B-roll", "Covers the jump"],
      ] },
    ],
  },
  "jump-cut": {
    title: "The jump cut",
    summary: "Using the jump as a style choice.",
    steps: [
      { kind: "theory", title: "From error to style", body: [
        "The **jump cut** is a cut within the same shot: the subject \"jumps\". In classic cinema it was an error; today on YouTube and TikTok it's a **style** that adds rhythm.",
        "To make it intentional, it's often paired with a **punch-in**: the clip after the cut is enlarged (scale 110–120%) as if there were a second camera.",
      ] },
      { kind: "quiz", question: "What's a punch-in?", options: ["A sound effect", "Enlarging the clip after a cut to simulate another camera", "A type of transition", "A codec"], explanation: "A digital zoom that makes the jump intentional." },
      { kind: "theory", title: "When it works", body: [
        "In vlogs, tutorials and fast-talking videos. Less so in emotional documentaries or films, where it distracts.",
      ] },
      { kind: "quiz", question: "In which video is a jump cut most appropriate?", options: ["An emotional wedding", "A fast YouTube vlog", "A nature documentary", "A historical film"], explanation: "Fast rhythm, informal tone: perfect for vlogs." },
      { kind: "studio", title: "Vlog style", instructions: "Turn the interview into vlog style: create **at least 3 jump cuts** by removing small pieces (with ripple), then make a **punch-in** (Scale ≥ **110**) on at least one clip after a cut.", goals: ["At least **3 jump cuts**", "No gaps", "A **punch-in** (Scale ≥ 110)"] },
    ],
  },
  "rallenty": {
    title: "Slow motion",
    summary: "Capture frame rate and smooth slow motion.",
    steps: [
      { kind: "theory", title: "Where slow motion comes from", body: [
        "For **smooth** slow motion you need to **shoot at more frames per second** than the sequence: e.g. 50 fps in a 25 fps sequence.",
        "Played at 25 fps, those 50 frames last twice as long: **50% speed**, no stuttering.",
      ] },
      { kind: "quiz", question: "You shot at 100 fps and the sequence is 25 fps. How much can you slow down without stuttering?", options: ["50%", "25%", "10%", "You can't"], explanation: "25 / 100 = 25%: every frame actually exists." },
      { kind: "theory", title: "Speed/Duration", body: [
        "In Premiere: select the clip and press **Ctrl+R** (**Speed/Duration**). Type the percentage; with **Ripple Edit** checked, clips after it shift.",
        "If you slow down more than the frame rate allows, Premiere must **invent** frames (frame blending or optical flow) and you'll see artifacts.",
      ] },
      { kind: "quiz", question: "A 25 fps clip slowed to 20% in a 25 fps sequence…", options: ["Will be perfectly smooth", "Will stutter or show artifacts", "Will be shorter", "Will go silent"], explanation: "There aren't enough real frames: you see stuttering or invented frames." },
      { kind: "studio", title: "Slow motion at 50%", instructions: "Slow down the drone to **50%** with **Speed/Duration (Ctrl+R)**, enabling **Ripple Edit** so the clip after shifts.", goals: ["Drone at **50%**", "Lasts double (**8 s**)", "No gaps or overlaps"] },
      { kind: "match", title: "Match", pairs: [
        ["50 fps → 25", "50% no stuttering"],
        ["Ctrl+R", "Speed/Duration"],
        ["Optical Flow", "Invented frames"],
        ["Ripple", "Shifts clips after"],
      ] },
    ],
  },
  "time-remapping": {
    title: "Time remapping",
    summary: "Speed ramps within a single clip.",
    steps: [
      { kind: "theory", title: "The speed ramp", body: [
        "**Time remapping** changes the speed **within** the same clip: fast → slow → fast. It's the effect of sports videos and trailers.",
        "In Premiere you do it with **speed keyframes** on the clip (right-click the fx icon → Time Remapping → Speed).",
      ] },
      { kind: "quiz", question: "What's a speed ramp?", options: ["A gradual speed change within the same clip", "A type of transition", "An audio effect", "An export format"], explanation: "Speeds up and slows down smoothly in the same clip." },
      { kind: "theory", title: "The \"pieced\" version", body: [
        "A simple way to get the same effect: **cut** the clip in three, leave the outer pieces normal and **slow down** the middle one. Then soften with short dissolves if needed.",
      ] },
      { kind: "quiz", question: "You want to slow down only the moment of a skater's jump. Which piece do you slow?", options: ["The whole video", "Only the jump piece", "Only the beginning", "None"], explanation: "Emphasis goes on the key moment." },
      { kind: "studio", title: "Slow down only the key moment", instructions: "Cut the city at **2 s** and **4 s**: leave the outer pieces at 100% and bring the **middle** piece to **50% or less**. Everything must stay connected.", hint: "After cutting, select the middle piece, **Ctrl+R**, 50% with **Ripple Edit** on.", goals: ["At least **3 pieces**", "First piece at normal speed", "A middle piece at **≤ 50%**", "No gaps"] },
    ],
  },
  "fps": {
    title: "Frames and fps",
    summary: "24, 25, 30, 60: what actually changes.",
    steps: [
      { kind: "theory", title: "Most common frame rates", body: [
        "**24 fps**: the cinema look. **25 fps**: TV and video in Europe (PAL). **30 fps** (29.97): TV and web in America. **50/60 fps**: sports, gaming, smooth motion.",
        "More fps = smoother, more detailed motion; fewer fps = more \"cinematic\", with a slight motion blur.",
      ] },
      { kind: "quiz", question: "Which frame rate gives the classic \"cinema look\"?", options: ["24 fps", "50 fps", "60 fps", "120 fps"], explanation: "24 fps has been the cinema standard for nearly a century." },
      { kind: "theory", title: "Mixing frame rates", body: [
        "Putting a 30 fps clip in a 25 fps sequence creates small **stutters** (skipped or repeated frames). Choose the sequence frame rate **first** and shoot accordingly.",
      ] },
      { kind: "quiz", question: "Why is it better to shoot at 25 fps if the video is for Italian TV?", options: ["Because it weighs less", "Because it's the PAL standard and avoids stutters and light flicker", "Because it's more colorful", "Because editing is faster"], explanation: "Following the standard avoids conversions and flicker with 50 Hz lights." },
      { kind: "studio", title: "A cinema sequence", instructions: "Create a new **4K UHD (3840×2160)** sequence at **24 fps** and name it **Short Film**.", goals: ["Sequence **3840×2160**", "At **24 fps** (or 23.976)", "Named **Short Film**"] },
      { kind: "match", title: "Match", pairs: [
        ["24 fps", "Cinema"],
        ["25 fps", "European TV"],
        ["30 fps", "Web and American TV"],
        ["60 fps", "Sports and gaming"],
      ] },
    ],
  },
  "fermo-immagine": {
    title: "Freeze frame",
    summary: "Freezing a moment to emphasize it.",
    steps: [
      { kind: "theory", title: "Freezing time", body: [
        "A **freeze frame** holds one frame for several seconds: to introduce a character (*\"This is me…\"*), for a punchline, to let text be read.",
        "In Premiere: playhead on the right frame → right-click the clip → **Add Frame Hold** (from the playhead onward the clip freezes) or **Insert Frame Hold Segment**.",
      ] },
      { kind: "quiz", question: "Which use of freeze frame is most typical?", options: ["Introducing a character with text", "Raising the volume", "Changing the format", "Stabilizing"], explanation: "The classic \"freeze frame + name\" of comedies." },
      { kind: "theory", title: "Making it richer", body: [
        "A freeze frame often gets a slight **zoom**, a **white flash** or a sound effect (*whoosh*, camera shutter).",
      ] },
      { kind: "quiz", question: "Which sound goes well with a freeze frame?", options: ["A camera shutter", "10 seconds of total silence", "A siren", "Never any sound"], explanation: "The shutter makes it obvious that time has stopped." },
      { kind: "studio", title: "Freeze frame!", instructions: "Move the playhead to about **3 s** on the interview and use **Clip → Video Options → Add Frame Hold** (or right-click the clip): from there the image stays frozen.", goals: ["There's a **freeze frame**", "…around **3 s**"] },
      { kind: "studio", title: "Freeze + whoosh", instructions: "Now complete the effect: add a freeze frame at about **2 s** on the sunset **and** put **Whoosh.wav** on A2 starting close to the freeze (within half a second).", goals: ["Freeze frame at ~2 s", "Whoosh synced with the freeze"] },
    ],
  },
  "reverse": {
    title: "Reverse and loop",
    summary: "Playing backward and creating cycles.",
    steps: [
      { kind: "theory", title: "The world in reverse", body: [
        "With **Speed/Duration → Reverse Speed** the clip plays **backward**: water goes back into the glass, the diver rises.",
        "Used sparingly it's magical; too often it gets silly.",
      ] },
      { kind: "quiz", question: "Where do you find \"Reverse Speed\"?", options: ["In the Speed/Duration window (Ctrl+R)", "In Lumetri", "In the Audio panel", "In the export"], explanation: "It's a checkbox in the Speed/Duration window." },
      { kind: "theory", title: "The boomerang", body: [
        "A **boomerang loop** is made like this: the normal clip followed immediately by the **same clip reversed**. The motion goes back and forth endlessly, like in Instagram stories.",
      ] },
      { kind: "quiz", question: "How do you build a boomerang?", options: ["Normal clip + the same clip reversed", "Two dissolves", "A clip at 200%", "A freeze frame"], explanation: "Forward and backward, and the loop is perfect." },
      { kind: "studio", title: "Boomerang", instructions: "Create a boomerang with the drone: leave the first clip normal, put a **copy** right after (**Ctrl+C**, **Ctrl+V**) and **reverse it** (Ctrl+R → Reverse Speed).", goals: ["At least **2 clips** of the drone", "One normal and one **reversed**", "One attached to the other"] },
    ],
  },
  "testi": {
    title: "Text essentials",
    summary: "Font, sizes and readable contrast.",
    steps: [
      { kind: "theory", title: "Text must be readable", body: [
        "Three rules: **simple font** (sans serif for screen), **size** large enough (on 1080p at least 60–80 px for titles), **strong contrast** with the background.",
        "If the background is busy, add a **drop shadow**, **stroke** or **semi-transparent box** behind it.",
      ] },
      { kind: "quiz", question: "White text over a light sky: how do you make it readable?", options: ["Make it smaller", "Add shadow or dark box", "Make it light yellow", "Leave it"], explanation: "Shadow or background creates the missing contrast." },
      { kind: "theory", title: "The Type tool", body: [
        "Press **T** and click in the Program Monitor: a **graphic clip** is created on the first available track. Style is changed in the **Properties** panel (or Essential Graphics).",
      ] },
      { kind: "quiz", question: "What's the shortcut for the Type tool?", options: ["T", "C", "V", "M"], explanation: "T for Type." },
      { kind: "studio", title: "Your first title", instructions: "Above the sunset create a title with the **Type tool (T)** saying **Summer 2026**, at least **80 px**, with **shadow** enabled.", hint: "After typing, select the text and open the **Properties** panel: size and **Shadow** are there.", goals: ["Title **Summer 2026**", "Size ≥ **80 px**", "With **shadow**"] },
      { kind: "match", title: "Match", pairs: [
        ["Sans serif", "Font without serifs, readable"],
        ["Contrast", "Difference between text and background"],
        ["Shadow", "Separates text from background"],
        ["T", "Type tool"],
      ] },
    ],
  },
  "lower-third": {
    title: "The lower third",
    summary: "Name and role of the speaker.",
    steps: [
      { kind: "theory", title: "The name strap", body: [
        "The **lower third** is the text in the **bottom third** of the screen with **name and role** of the speaker.",
        "It appears the first time the person speaks, stays **4–6 seconds** and disappears. It sits to the left (or right) to avoid covering the face.",
      ] },
      { kind: "quiz", question: "How long does a lower third usually stay on screen?", options: ["Half a second", "4–6 seconds", "The whole video", "One minute"], explanation: "Long enough to read twice, then it gets out of the way." },
      { kind: "theory", title: "Hierarchy", body: [
        "The **name** is larger and bold; the **role** below it, smaller. A box or colored bar helps separate it from the image.",
      ] },
      { kind: "quiz", question: "Where is a lower third positioned?", options: ["Center over the face", "In the bottom third, to the side", "Top center", "Off screen"], explanation: "At the bottom and to the side, away from the face." },
      { kind: "studio", title: "Introduce the interviewee", instructions: "Add a **lower third** over the interview: text in the **bottom third** (below 720 px) and in the **left half**, with a **name** of your choice. It should last between **3 and 7 s**.", hint: "Essential Graphics → **Browse** has the **Lower Third** template: use it, then drag the text to the left in the Program Monitor and trim the clip.", goals: ["Text in the **bottom third**", "In the **left half**", "Lasts **3–7 s**"] },
    ],
  },
  "safe-margin": {
    title: "Safe margins",
    summary: "Keeping titles away from the edges.",
    steps: [
      { kind: "theory", title: "Safe zones", body: [
        "Some screens (old TVs, phones with notches, app interfaces) **cut the edges**. That's why **safe zones** exist: action (about 93%) and **title (about 90%)**.",
        "On vertical social media the interfaces cover the **bottom** (captions, buttons) and the **right** (like, comments): text goes higher and more centered.",
      ] },
      { kind: "quiz", question: "Why shouldn't subtitles be placed at the very bottom edge in Reels?", options: ["Because it's forbidden", "Because the app's captions and buttons are there", "Because they're too big", "To save space"], explanation: "The Instagram/TikTok interface covers exactly that area." },
      { kind: "theory", title: "In Premiere", body: [
        "In the Program Monitor, wrench menu → **Safe Margins**: guides appear. All text should stay inside the inner box.",
      ] },
      { kind: "quiz", question: "What percentage of the screen is the title safe zone?", options: ["About 50%", "About 90%", "100%", "110%"], explanation: "The inner box, about 90%." },
      { kind: "studio", title: "Move it inside the margins", instructions: "The title is stuck at the bottom right edge: drag it **inside the safe zone** (at least 10% from each edge).", goals: ["The title is still there", "Title inside the **safe zone**"] },
    ],
  },
  "sottotitoli": {
    title: "Subtitles",
    summary: "Generate, correct and style subtitles.",
    steps: [
      { kind: "theory", title: "Why subtitles", body: [
        "On social media **85%** of videos are watched **without sound**. Subtitles keep people watching and make the video accessible to those who can't hear.",
        "Premiere generates them from the transcript (**Text → Transcribe**), but they should always be **reviewed and corrected**: names and technical terms are often wrong.",
      ] },
      { kind: "quiz", question: "Why correct auto-generated subtitles?", options: ["Never needed", "Recognition often gets names and terms wrong", "To make them longer", "To change language"], explanation: "Auto-transcription is a great starting point, not the final result." },
      { kind: "theory", title: "Golden rules", body: [
        "Maximum **2 lines**, about **35–42 characters** per line, each on screen for at least **1 second**. White with stroke or black background: readable on anything.",
      ] },
      { kind: "quiz", question: "How many lines maximum for a subtitle?", options: ["1", "2", "4", "As many as needed"], explanation: "Two lines: more can't be read in time." },
      { kind: "studio", title: "Subtitle the first sentence", instructions: "Add a subtitle saying **Hello everyone!** in the **lower** part of the screen (below 860 px), with **background box** enabled, lasting from **0** to about **2–4 s**.", goals: ["Text **Hello everyone!**", "At the bottom", "With **background box**", "Lasts **2–4 s** from the start"] },
    ],
  },
  "grafiche-essenziali": {
    title: "Essential Graphics",
    summary: "Using and customizing templates.",
    steps: [
      { kind: "theory", title: "Ready-made templates", body: [
        "The **Essential Graphics** panel contains **templates** for titles, lower thirds, subtitles. Drag them to the timeline and change text, colors and font.",
        "You can also create your **own** templates and reuse them across all projects: this way every video on your channel has the same style.",
      ] },
      { kind: "quiz", question: "Why create your own graphics templates?", options: ["For a consistent style across all videos", "For faster export", "For more tracks", "Not needed"], explanation: "Consistency = brand recognition." },
      { kind: "theory", title: "Multiple layers in a graphic", body: [
        "A graphic clip can contain **multiple layers**: text, rectangles, ellipses. With the graphic selected, create a new layer and it adds inside the same clip.",
      ] },
      { kind: "quiz", question: "You want a colored rectangle behind the name. What do you add?", options: ["A shape layer (rectangle) in the same graphic", "A new sequence", "An audio effect", "A transition"], explanation: "Text + shape in the same graphic clip." },
      { kind: "studio", title: "Customize a template", instructions: "Use the **Large Caption** template (or another) from **Essential Graphics → Browse**, change the text to **CHAPTER 2** and add a **rectangle** to the same graphic.", goals: ["Text **CHAPTER 2**", "A **rectangle** in the same graphic"] },
    ],
  },

  // Section 3
  "rec709": { title: "What is Rec.709", summary: "The color standard of every video you watch.", steps: [
    { kind: "theory", title: "One standard for all", body: ["**Rec.709** is the standard for HD video: it defines which colors exist (the **color space**), how brightness is distributed (the **gamma**) and where white and black sit.", "Almost everything you watch on YouTube, TV and phone is (or ends up) in Rec.709. It's the \"common language\" between your timeline and the viewer's screen."], terms: [{ term: "Color space", def: "The set of reproducible colors" }, { term: "Gamma", def: "How values become brightness" }] },
    { kind: "quiz", question: "Why work in Rec.709 for YouTube?", options: ["Because it weighs less", "Because it's the standard screens expect", "Because it's black and white", "You don't work in Rec.709"], explanation: "If the timeline speaks Rec.709, what you see is what the viewer will see." },
    { kind: "theory", title: "\"Flat\" video", body: ["Many cameras record in a **flat** way (low contrast and saturation) to preserve detail. The colorist's first step is to bring that image to a **normal** Rec.709: black blacks, white whites, believable colors."] },
    { kind: "quiz", question: "A gray, washed-out image just imported needs…", options: ["More contrast and saturation", "Less contrast", "An audio effect", "A transition"], explanation: "Bring it to a normal look before any creative choices." },
    { kind: "studio", title: "From flat to normal", instructions: "The sunset is **flat**. With **Lumetri Color** bring it to a normal look: overall **Contrast** at least **+20** and **Saturation** at least **110**.", goals: ["Overall contrast ≥ **+20**", "Overall saturation ≥ **110**"] },
    { kind: "match", title: "Match", pairs: [["Rec.709", "HD video standard"], ["Color space", "Which colors exist"], ["Gamma", "Brightness distribution"], ["Flat", "Low contrast and saturation"]] },
  ] },
  "gamma": { title: "Color spaces and gamma", summary: "Why the same file looks different on two screens.", steps: [
    { kind: "theory", title: "Same file, different screens", body: ["A phone at max brightness, a cheap monitor and a TV show the same video differently. That's why colorists use a **calibrated** monitor.", "**Gamma** decides how midtone values become light: higher gamma darkens midtones, lower brightens them."] },
    { kind: "quiz", question: "Why do colorists use calibrated monitors?", options: ["For better gaming", "To see true color, not what the screen fakes", "Because they cost less", "Not needed"], explanation: "If the screen lies, every correction is wrong." },
    { kind: "theory", title: "Midtones with Levels", body: ["The **Levels** effect has a **Gamma** slider: above 1 it brightens midtones **without** touching blacks and whites. The cleanest way to open a slightly dark image."] },
    { kind: "quiz", question: "You want to brighten shadowed faces without burning the sky. What do you adjust?", options: ["Gamma (midtones)", "White point", "Volume", "Duration"], explanation: "Gamma works on midtones and leaves the extremes alone." },
    { kind: "studio", title: "Open the midtones", instructions: "The interview is a bit dark in the midtones. Apply the **Levels** effect (Video Effects → Adjustment) and bring the **Gamma** between **1.2** and **1.6**.", goals: ["Levels Gamma between **1.2** and **1.6**"] },
  ] },
  "log": { title: "Log vs Rec.709", summary: "Why Log footage looks gray and how to correct it.", steps: [
    { kind: "theory", title: "The Log profile", body: ["Modern cameras record in **Log** (S-Log, V-Log, C-Log…): a curve that compresses highlights and shadows to **preserve more dynamic range**.", "The result looks **gray and washed out**. It's not a mistake: it's a digital negative that needs to be **converted** to Rec.709 (with a technical LUT or manually)."] },
    { kind: "quiz", question: "Why does Log footage look gray?", options: ["The camera is broken", "The Log curve compresses highlights and shadows to preserve detail", "Audio is missing", "It's black and white"], explanation: "It's by design: more information to recover later." },
    { kind: "theory", title: "The right order", body: ["First **convert** the Log (technical LUT or correction), then **correct** (exposure, balance), then do the creative **look**. Reversing the order makes everything harder."] },
    { kind: "quiz", question: "What's the correct order?", options: ["Look → conversion → correction", "Conversion → correction → look", "Correction → look → conversion", "Order doesn't matter"], explanation: "First bring to Rec.709, then correct, then create the style." },
    { kind: "studio", title: "Convert the Log manually", instructions: "The drone was shot in **Log**: gray and flat. With Lumetri bring overall **Contrast** to at least **0** and **Saturation** to at least **95**.", goals: ["Overall contrast ≥ **0**", "Overall saturation ≥ **95**"] },
    { kind: "studio", title: "Then the look", instructions: "Now that the drone is converted, add **after** the Lumetri an **Apply Color LUT** effect with the **Cinematic teal & orange** look.", goals: ["LUT **Cinematic teal & orange**", "LUT comes **after** Lumetri"] },
  ] },
  "bit-depth": { title: "Bit depth and compression", summary: "8 bit, 10 bit and banding.", steps: [
    { kind: "theory", title: "How many shades", body: ["**Bit depth** tells how many shades each channel has: **8 bit** = 256 levels, **10 bit** = 1024. With more levels, gradual transitions (a sky, a wall) stay smooth.", "With few bits and heavy compression you get **banding**: visible stripes instead of a smooth gradient."] },
    { kind: "quiz", question: "How many levels per channel does a 10-bit video have?", options: ["256", "1024", "16", "10"], explanation: "2 to the 10th = 1024 levels, four times 8-bit." },
    { kind: "theory", title: "Fighting banding", body: ["Prevention is best (shoot 10-bit, don't push correction too hard). If it's already there, a touch of **grain** (*Add Grain*) breaks the stripes and makes them invisible."] },
    { kind: "quiz", question: "A sunset sky shows color stripes. What helps?", options: ["Adding a bit of grain", "Maxing out saturation", "Exporting at 1 Mbps", "Slowing the video"], explanation: "Grain masks the steps between levels." },
    { kind: "studio", title: "Hide the banding", instructions: "The sunset sky has banding. Add **Add Grain** (Noise & Grain) with **Intensity** at least **1.5**.", goals: ["Grain with intensity ≥ **1.5**"] },
    { kind: "match", title: "Match", pairs: [["8 bit", "256 levels"], ["10 bit", "1024 levels"], ["Banding", "Stripes in gradients"], ["Grain", "Breaks the stripes"]] },
  ] },
  "hdr": { title: "HDR in brief", summary: "What changes with PQ and HLG.", steps: [
    { kind: "theory", title: "High Dynamic Range", body: ["**HDR** allows much **brighter** highlights and more shadow detail compared to SDR (Rec.709). Measured in **nits**: SDR reaches about 100, HDR 1000 and beyond.", "Two main standards: **PQ** (HDR10, Dolby Vision: cinema and streaming) and **HLG** (broadcast, compatible with SDR TVs)."] },
    { kind: "quiz", question: "Which HDR standard is designed to be compatible with regular TVs?", options: ["PQ", "HLG", "Rec.709", "ProRes"], explanation: "HLG looks acceptable even on SDR screens." },
    { kind: "theory", title: "Watch out for blown highlights", body: ["In SDR, highlights beyond 100% get **blown** (flat white with no detail). Even in SDR, keep whites below the limit: lost detail can't be recovered."] },
    { kind: "quiz", question: "What does \"blown highlights\" mean?", options: ["White areas with no detail left", "Colors too saturated", "Distorted audio", "A type of transition"], explanation: "The sensor (or correction) exceeded the maximum: only white remains." },
    { kind: "studio", title: "Recover the highlights", instructions: "The sunset is overexposed and the sky is blown. With Lumetri bring overall **Exposure** to **≤ 0.3** and **Highlights** to **≤ 0**.", goals: ["Overall exposure ≤ **0.3**", "Highlights ≤ **0**"] },
  ] },
  "waveform": { title: "The waveform", summary: "Reading highlights and shadows precisely.", steps: [
    { kind: "theory", title: "Measuring light", body: ["The **waveform** shows image brightness from **0** (black) to **100** (white), left to right matching the image.", "A well-exposed image fills most of the scale: blacks near 0–5, whites near 90–100, without crushing at the extremes."] },
    { kind: "quiz", question: "In the waveform, the trace is all between 0 and 30. The image is…", options: ["Overexposed", "Underexposed", "Perfect", "Black and white"], explanation: "Everything low = everything dark." },
    { kind: "theory", title: "Eyes lie, scopes don't", body: ["After a while the eye **adapts** and a dark image looks normal. **Scopes** (Lumetri Scopes in Premiere) give objective numbers: trust them."] },
    { kind: "quiz", question: "Why use scopes instead of \"eyeballing it\"?", options: ["They're more colorful", "The eye adapts and can be wrong, scopes measure", "They're required for export", "Not needed"], explanation: "Measure instead of guess." },
    { kind: "studio", title: "Bring it back to scale", instructions: "According to the waveform the city is **underexposed** (all at the bottom). Correct overall **Exposure** to between **−0.4** and **+0.6**.", goals: ["Overall exposure between **−0.4** and **+0.6**"] },
    { kind: "match", title: "Match", pairs: [["0 IRE", "Black"], ["100 IRE", "White"], ["Trace at bottom", "Dark image"], ["Scopes", "Objective measurements"]] },
  ] },
  "vectorscope": { title: "The vectorscope", summary: "Hue and saturation under control.", steps: [
    { kind: "theory", title: "A circle of colors", body: ["The **vectorscope** is a circle: the **direction** shows the **hue** (red, yellow, green, cyan, blue, magenta), the **distance from center** shows **saturation**.", "A black and white image is a dot at the center. An oversaturated image reaches toward the edges, beyond the reference boxes."] },
    { kind: "quiz", question: "In the vectorscope, what does distance from center indicate?", options: ["Brightness", "Saturation", "Duration", "Volume"], explanation: "Farther = more saturated." },
    { kind: "theory", title: "Legal saturation", body: ["For TV, colors must not exceed certain limits (the vectorscope boxes). On the web you're freer, but oversaturated colors look fake and \"bleed\"."] },
    { kind: "quiz", question: "A perfectly black and white image in the vectorscope is…", options: ["A full circle", "A dot at the center", "A line toward red", "Invisible"], explanation: "Zero saturation: everything at center." },
    { kind: "studio", title: "Too saturated!", instructions: "The coffee has been oversaturated and the vectorscope goes outside the boxes. Bring overall **Saturation** between **90** and **120**.", goals: ["Overall saturation **90–120**"] },
  ] },
  "parade": { title: "The RGB parade", summary: "Finding color casts.", steps: [
    { kind: "theory", title: "Three channels side by side", body: ["The **RGB parade** shows three waveforms side by side: **red**, **green** and **blue**. On something neutral (white, gray) the three channels should be at the **same height**.", "If blue is higher than the others, the image has a **cool cast**; if red is higher, **warm**."] },
    { kind: "quiz", question: "In the parade, the red channel is much higher than green and blue. The image is…", options: ["Too cool", "Too warm", "Perfect", "Underexposed"], explanation: "Excess red = warm cast." },
    { kind: "theory", title: "Correcting the cast", body: ["In Lumetri: **Temperature** shifts between blue and orange, **Tint** between green and magenta. Align the channels on neutral areas."] },
    { kind: "quiz", question: "Which slider corrects a green cast (neon lights)?", options: ["Temperature", "Tint", "Exposure", "Vignette"], explanation: "Tint works on the green–magenta axis." },
    { kind: "studio", title: "Remove the warm cast", instructions: "The city is all orange: in the parade red dominates. Bring overall **Temperature** between **−15** and **+15**.", goals: ["Overall temperature **−15…+15**"] },
    { kind: "match", title: "Match", pairs: [["Blue high", "Cool cast"], ["Red high", "Warm cast"], ["Temperature", "Blue–orange axis"], ["Tint", "Green–magenta axis"]] },
  ] },
  "istogramma": { title: "The histogram", summary: "Tone distribution at a glance.", steps: [
    { kind: "theory", title: "A mountain of pixels", body: ["The **histogram** counts how many pixels exist at each brightness level: shadows on the left, highlights on the right.", "A mountain **crushed against the left edge** means **crushed blacks** (lost); against the right, **blown highlights**."] },
    { kind: "quiz", question: "The histogram is crushed against the left edge. What's happening?", options: ["Shadows are crushed and detail is lost", "Highlights are blown", "Everything's fine", "There's too much audio"], explanation: "Pixels are piled on absolute black." },
    { kind: "theory", title: "Opening the shadows", body: ["The Lumetri **Shadows** slider lifts dark areas without touching the rest: recovers detail in hair, dark clothing, corners."] },
    { kind: "quiz", question: "Which slider recovers detail in dark areas?", options: ["Highlights", "Shadows", "Saturation", "Tint"], explanation: "Shadows acts right there." },
    { kind: "studio", title: "Recover the shadows", instructions: "The interview shadows are crushed. Bring overall **Shadows** to at least **−10** (they start at −80) without raising exposure above **+0.5**.", goals: ["Shadows ≥ **−10**", "Exposure ≤ **+0.5**"] },
  ] },
  "skin-line": { title: "The skin tone line", summary: "Natural skin with the vectorscope.", steps: [
    { kind: "theory", title: "All skin on one line", body: ["In the vectorscope there's a diagonal line between red and yellow: the **skin tone line**. Human skin, **of any color**, falls near it: the saturation changes, not the hue.", "If the face drifts toward **magenta** or **green**, people look sick or fake."] },
    { kind: "quiz", question: "In the vectorscope, skin of people with different complexions…", options: ["Is on opposite sides", "Falls near the same line, only the distance from center changes", "Is invisible", "Is always at center"], explanation: "Same hue, different saturation." },
    { kind: "theory", title: "Isolating the face", body: ["To check just the skin, colorists zoom in on the face or use a mask, so the vectorscope shows only those pixels."] },
    { kind: "quiz", question: "The face leans toward green. What do you correct?", options: ["Tint toward magenta", "Temperature toward blue", "Volume", "Saturation to zero"], explanation: "Green is compensated with magenta on the Tint axis." },
    { kind: "studio", title: "Natural skin", instructions: "The interviewee's skin is **magenta**: Tint is at +50. Bring overall **Tint** between **−10** and **+10** and keep **Temperature** within ±20.", goals: ["Tint **−10…+10**", "Temperature within **±20**"] },
  ] },
  "esposizione": { title: "Exposure", summary: "Bringing highlights and shadows into the right range.", steps: [
    { kind: "theory", title: "The first slider", body: ["**Exposure** in Lumetri raises or lowers the entire image in **stops** (like on the camera): +1 doubles the light, −1 halves it.", "It's the first step of every correction: light first, then the rest."] },
    { kind: "quiz", question: "Exposure +1 in Lumetri means…", options: ["A bit brighter", "Double the light (one stop)", "More saturation", "More contrast"], explanation: "One stop = double the light." },
    { kind: "theory", title: "Highlights and shadows separately", body: ["After exposure you refine **Highlights** (bright areas) and **Shadows** (dark areas) to recover detail without changing the rest."] },
    { kind: "quiz", question: "The sky is blown but the subject looks fine. What do you lower?", options: ["Highlights", "Shadows", "Tint", "Vibrance"], explanation: "Highlights act only on bright areas." },
    { kind: "studio", title: "Too dark", instructions: "The drone is underexposed by two stops. Bring overall **Exposure** between **−0.3** and **+0.5**.", goals: ["Exposure **−0.3…+0.5**"] },
    { kind: "studio", title: "Too bright", instructions: "Now the opposite: the city is **overexposed**. Exposure between **−0.3** and **+0.3** and **Highlights** at **≤ 0**.", goals: ["Exposure **−0.3…+0.3**", "Highlights ≤ **0**"] },
  ] },
  "contrasto": { title: "Contrast", summary: "Adding depth without burning detail.", steps: [
    { kind: "theory", title: "Depth", body: ["**Contrast** is the distance between dark and bright areas. Low contrast = flat image; too much = crushed shadows and blown highlights.", "Good contrast separates the subject from the background and adds **dimensionality**."] },
    { kind: "quiz", question: "Too much contrast risks…", options: ["Crushing shadows and blowing highlights", "Lowering volume", "Slowing the video", "Changing format"], explanation: "Extremes get crushed and detail is lost." },
    { kind: "theory", title: "Contrast with control", body: ["Raise **Contrast** and then recover with **Highlights** (down) and **Shadows** (up) if extremes are lost. Same idea as an **S-curve**."] },
    { kind: "quiz", question: "After raising contrast the sky is blown. What do you do?", options: ["Lower Highlights", "Raise saturation", "Raise Highlights", "Nothing"], explanation: "Highlights recover the bright areas." },
    { kind: "studio", title: "Add depth", instructions: "The sunset is flat. Bring overall **Contrast** to at least **+25**, but keep **Highlights** at **≤ +10** to avoid burning the sky.", goals: ["Contrast ≥ **+25**", "Highlights ≤ **+10**"] },
  ] },
  "bilanciamento-bianco": { title: "White balance", summary: "Removing warm or cool casts.", steps: [
    { kind: "theory", title: "White must be white", body: ["Every light has a **color temperature**: a home bulb is warm (orange, ~3200 K), an overcast sky is cool (blue, ~6500 K and above).", "If the camera wasn't set right, the image has a **cast**. White balance removes it: what was white becomes white again."], terms: [{ term: "Kelvin (K)", def: "Color temperature unit" }, { term: "Eyedropper", def: "Click on a white area and Lumetri balances automatically" }] },
    { kind: "quiz", question: "A shot indoors with incandescent bulbs tends to look…", options: ["Blue", "Orange", "Green", "Purple"], explanation: "Tungsten light is warm." },
    { kind: "theory", title: "The eyedropper", body: ["In Lumetri there's the **white balance eyedropper**: click on something that should be white or gray and Temperature and Tint adjust automatically."] },
    { kind: "quiz", question: "What do you click with the white balance eyedropper?", options: ["A face", "Something that should be white or neutral gray", "A blue sky", "A red object"], explanation: "You need a neutral reference." },
    { kind: "studio", title: "Warm up a cold image", instructions: "The sea is too **blue** (Temperature −60). Bring overall **Temperature** between **−10** and **+10**.", goals: ["Temperature **−10…+10**"] },
  ] },
  "saturazione": { title: "Saturation and vibrance", summary: "Vivid but believable colors.", steps: [
    { kind: "theory", title: "Two different sliders", body: ["**Saturation** raises **all** colors equally. **Vibrance** mainly raises **undersaturated** colors and protects already-strong ones and skin.", "That's why colorists almost always prefer **Vibrance**: richer colors without orange faces."] },
    { kind: "quiz", question: "You want more vivid colors without making faces orange. What do you use?", options: ["Saturation at max", "Vibrance", "Exposure", "Tint"], explanation: "Vibrance protects skin and already-saturated colors." },
    { kind: "theory", title: "Less is more", body: ["An oversaturated image is tiring and looks fake. Often **+10/+20** vibrance is enough."] },
    { kind: "quiz", question: "What's a reasonable vibrance value for a natural look?", options: ["+15", "+100", "−100", "+500"], explanation: "Small tweaks, big difference." },
    { kind: "studio", title: "Vivid colors, natural faces", instructions: "Make the coffee more inviting with **Vibrance** (at least **+20**) but keep overall **Saturation** at **≤ 120**.", goals: ["Vibrance ≥ **+20**", "Saturation ≤ **120**"] },
  ] },
  "match-clip": { title: "Matching two clips", summary: "Making two cameras look like one.", steps: [
    { kind: "theory", title: "One scene, one color", body: ["Two different cameras (or the same with different light) give different colors. If you alternate without correcting, the viewer **feels** the jump.", "You pick a **reference** clip (the *hero shot*) and bring the others toward it, watching the scopes side by side."] },
    { kind: "quiz", question: "What's the reference clip when matching color?", options: ["The shortest one", "The one you align all others to", "The last in the timeline", "A black clip"], explanation: "All others are brought toward it." },
    { kind: "theory", title: "Side-by-side comparison", body: ["Lumetri has a **Comparison View**: reference on the left, clip to correct on the right. Focus especially on **skin**, **whites** and **blacks**."] },
    { kind: "quiz", question: "What do you check first to match two interview shots?", options: ["Skin and neutrals", "Duration", "Volume", "File names"], explanation: "Skin and neutrals immediately betray differences." },
    { kind: "studio", title: "Match the two shots", instructions: "The first clip (reference) is warm, the second is neutral. Bring the **second** clip to the same temperature as the first (difference ≤ **10**).", goals: ["Temperatures matched (≤ 10 difference)"] },
  ] },
  "lut": { title: "Looks and LUTs", summary: "Applying a LUT at the right point in the chain.", steps: [
    { kind: "theory", title: "What's a LUT", body: ["A **LUT** (Look-Up Table) is a table that transforms every color into another. There are **technical** LUTs (Log to Rec.709) and **creative** LUTs (a look: teal & orange, film…).", "A creative LUT should be applied **after** correction: if the starting image is wrong, the look will be wrong."] },
    { kind: "quiz", question: "Where does a creative LUT go in the effect chain?", options: ["Before everything", "After the primary correction", "Instead of audio", "Doesn't matter"], explanation: "First correct the image, then the look." },
    { kind: "theory", title: "Dosing the look", body: ["A LUT at 100% is often too strong. In Lumetri you can lower its **intensity**, or put it on an **adjustment layer** with reduced opacity."] },
    { kind: "quiz", question: "The LUT is too strong. How do you soften it?", options: ["Lower intensity or adjustment layer opacity", "Export at 720p", "Raise the volume", "You can't"], explanation: "Dose it like an ingredient." },
    { kind: "studio", title: "Correction, then look", instructions: "The sunset already has a Lumetri correction. Add **after** it an **Apply Color LUT** with the **Warm Film** look.", goals: ["LUT **Warm Film**", "After Lumetri"] },
    { kind: "studio", title: "A look for the whole sequence", instructions: "Apply the look to **all** clips at once: create an **Adjustment Layer** (File → New), put it on **V2** above the clips and apply the **Cinematic teal & orange** LUT.", goals: ["Adjustment layer on V2", "…with the teal & orange LUT", "Covers both clips"] },
  ] },
  "curve": { title: "Curves", summary: "The colorist's most powerful tool.", steps: [
    { kind: "theory", title: "The tone curve", body: ["The **curve** puts input (horizontal) and output (vertical) on a graph. A straight line changes nothing; moving points adjusts shadows, midtones and highlights precisely.", "The classic **S-curve** lowers shadows slightly and raises highlights slightly: more contrast, but smooth."] },
    { kind: "quiz", question: "What effect does an S-curve have?", options: ["Smooth contrast", "Black and white", "Less light everywhere", "Inverts colors"], explanation: "Shadows down, highlights up: controlled contrast." },
    { kind: "theory", title: "Black point and white point", body: ["The curve's extremes are the **black point** and **white point**. Moving them inward \"stretches\" the image: exactly what the **Levels** effect does with *Input Black* and *Input White*."], tip: "In the simulator we use Levels: same principle as the two ends of the curve." },
    { kind: "quiz", question: "Raising Input Black in Levels from 0 to 15 makes…", options: ["Dark grays become black: more shadow contrast", "The image turns white", "Audio increases", "Nothing"], explanation: "Everything below 15 becomes pure black." },
    { kind: "studio", title: "Stretch the tones", instructions: "The coffee is grayish. With **Levels** bring **Input Black** to at least **12** and **Input White** to **≤ 240**: blacker blacks, whiter whites.", goals: ["Input Black ≥ **12**", "Input White ≤ **240**"] },
  ] },
  "hsl": { title: "HSL secondary correction", summary: "Isolating and changing a single color.", steps: [
    { kind: "theory", title: "Primary and secondary", body: ["**Primary** correction affects the entire image. **Secondary** isolates a part: a color (with HSL), a zone (with a mask) or both.", "With the **HSL secondary** in Lumetri you select a color (e.g. the green of grass) and change its hue, saturation and luminance without touching the rest."], terms: [{ term: "H", def: "Hue" }, { term: "S", def: "Saturation" }, { term: "L", def: "Luminance" }] },
    { kind: "quiz", question: "You want to make only the sky bluer without touching faces. What do you use?", options: ["Primary correction", "HSL secondary", "Exposure", "Volume"], explanation: "The secondary isolates a single color." },
    { kind: "theory", title: "Rotating the hue", body: ["**Color Balance (HLS)** rotates the **hue** of the entire image by a certain angle: +30° shifts reds toward orange, greens toward cyan… Useful for understanding how the color wheel works."] },
    { kind: "quiz", question: "Rotating the hue by 180° turns blue into…", options: ["Orange/yellow", "Darker blue", "Gray", "Green"], explanation: "On the color wheel, the opposite of blue is orange." },
    { kind: "studio", title: "Spin the color wheel", instructions: "Apply **Color Balance (HLS)** to the drone and rotate the **Hue** by at least **30°** (in either direction) to transform the sea into a fantasy color.", goals: ["Hue rotated by ≥ **30°**"] },
  ] },
  "maschere-colore": { title: "Masks and tracking", summary: "Correcting only one area of the image.", steps: [
    { kind: "theory", title: "Correcting a zone", body: ["With a **mask** you limit an effect to a zone: brighten just the face, darken just the sky, blur a license plate.", "A **feathered** mask (high feather) makes the correction invisible: the transition is gradual."] },
    { kind: "quiz", question: "Why feather the edge of a correction mask?", options: ["To make it invisible with a gradual transition", "For faster export", "To change format", "Never feathered"], explanation: "A hard edge would be immediately noticeable." },
    { kind: "theory", title: "Tracking", body: ["If the subject moves, the mask must **follow**: **tracking** analyzes the motion frame by frame and moves the mask automatically."] },
    { kind: "quiz", question: "The face you want to brighten moves in the shot. What do you need?", options: ["Mask tracking", "Another sequence", "The 180° rule", "A freeze frame"], explanation: "Tracking makes the mask follow the subject." },
    { kind: "studio", title: "A light only on the subject", instructions: "In After Effects: there's an **adjustment layer** above the video. Draw an **elliptical mask** on it (Ellipse tool, **Q**), feather it (**Mask Feather** ≥ **40**) and apply **Lumetri Color** with **Exposure** ≥ **+0.5**.", hint: "Select the adjustment layer, choose the **Ellipse** tool and drag in the Composition panel. Press **F** to see Mask Feather.", goals: ["Mask on the adjustment layer", "Feather ≥ **40**", "Lumetri with Exposure ≥ **+0.5**"] },
  ] },
  "creare-look": { title: "Creating a look", summary: "Teal & orange, vintage, black and white.", steps: [
    { kind: "theory", title: "Most famous looks", body: ["**Teal & orange**: shadows toward teal, skin and highlights toward orange. It's the blockbuster look: separates people from the background.", "**Vintage**: lifted blacks (never pure black), muted colors, a touch of grain and a warm cast. **Black and white**: it's all about the contrast."] },
    { kind: "quiz", question: "Why does teal & orange work so well?", options: ["Because skin (orange) pops against its complement (teal)", "Because it weighs less", "Because it's black and white", "By chance"], explanation: "Complementary colors = maximum separation." },
    { kind: "theory", title: "The vignette", body: ["A subtle **vignette** darkens the edges and draws the eye to the center. In Lumetri, **negative** values darken the corners."] },
    { kind: "quiz", question: "What's a subtle vignette for?", options: ["To guide the eye toward the center", "To raise the volume", "To stabilize", "To subtitle"], explanation: "Darker edges, center takes the spotlight." },
    { kind: "studio", title: "Cinematic look", instructions: "Create a movie look on the city: LUT **Cinematic teal & orange**, overall **Contrast** ≥ **+15** and **Vignette** ≤ **−0.5**.", goals: ["LUT teal & orange", "Contrast ≥ **+15**", "Vignette ≤ **−0.5**"] },
    { kind: "studio", title: "Author's black and white", instructions: "Turn the interview into a high-contrast **black and white**: **Black & White** effect (or Saturation 0) and **Contrast** ≥ **+25**.", goals: ["In **black and white**", "Contrast ≥ **+25**"] },
  ] },

  // Section 4 — shorter, key fields only
  "composizioni": { title: "Compositions", summary: "The container for every animation.", steps: [
    { kind: "theory", title: "The composition", body: ["In After Effects everything lives inside a **composition** (comp): it has dimensions, frame rate, **duration** and a background color, like a Premiere sequence.", "Create one with **Composition → New Composition** (**Ctrl+N**). Inside are the **layers**, stacked: the top one covers those below."] },
    { kind: "quiz", question: "What's the main difference between a Premiere sequence and an After Effects composition?", options: ["None", "The comp has a fixed duration set at creation", "The comp has no dimensions", "The comp can't hold video"], explanation: "In AE you set the duration upfront; in Premiere the sequence grows on its own." },
    { kind: "theory", title: "Right settings", body: ["For social: **1080×1920** or **1080×1080**. For YouTube: **1920×1080**. **Duration** is best set a bit longer than needed: you can shorten later with the **work area**."] },
    { kind: "quiz", question: "How do you create a new composition?", options: ["Ctrl+N", "Ctrl+K", "Ctrl+M", "Ctrl+D"], explanation: "Like in Premiere, N for New." },
    { kind: "studio", title: "Your first composition", instructions: "Create a composition called **Intro**, **1920×1080**, **30 fps**, duration **10 seconds** (Composition → New Composition).", goals: ["Comp **1920×1080**", "At **30 fps**", "Lasts **10 s**", "Named **Intro**"] },
    { kind: "studio", title: "Fill it", instructions: "Add a background to the composition: **Layer → New → Solid** (**Ctrl+Y**) and a **text** with the Type tool (**Ctrl+T**).", hint: "In the AE timeline the layer on **top** is the one in front: drag up or down to change the order.", goals: ["A **solid**", "A **text** layer", "Text is **above** the background"] },
  ] },
  "livelli": { title: "Layers and precompositions", summary: "Organizing complex projects.", steps: [
    { kind: "theory", title: "Many types of layers", body: ["**Solid** (one color), **text**, **shape**, **footage** (video, images), **adjustment layer** (applies effects to everything below), **null object** (invisible, used to control other layers)."] },
    { kind: "quiz", question: "Which layer is invisible and used to control other layers?", options: ["Solid", "Null object", "Text", "Shape"], explanation: "The null isn't rendered: it's a handle." },
    { kind: "theory", title: "Precomposing", body: ["When layers pile up, group them into a **precomposition** (**Ctrl+Shift+C**): they become a single layer containing a comp. Like a folder that animates as a whole."] },
    { kind: "quiz", question: "What shortcut precomposes the selected layers?", options: ["Ctrl+Shift+C", "Ctrl+D", "Ctrl+K", "Alt+P"], explanation: "C for Compose: Ctrl+Shift+C." },
    { kind: "studio", title: "Group the title", instructions: "Select the text **SQUEAK** and the shape **Bar** and **precompose** them (Ctrl+Shift+C). In the main comp a **composition** layer should replace them.", goals: ["A **precomposition** layer exists", "The text is inside the precomp"] },
    { kind: "studio", title: "A control null", instructions: "Add a **null object** (Layer → New → Null Object) and rename it **Control** (Enter on the name).", goals: ["A **null object**", "Named **Control**"] },
  ] },
  "forme": { title: "Shape layers", summary: "Drawing and animating vector shapes.", steps: [
    { kind: "theory", title: "Vector shapes", body: ["**Shape layers** are drawn with the Rectangle, Ellipse, Star tools (**Q** to cycle). They're **vector**: you can scale them as much as you want without losing quality.", "Each shape has **Fill**, **Stroke** and animatable properties like **Size**."] },
    { kind: "quiz", question: "Why don't vector shapes lose quality when enlarged?", options: ["They're drawn with formulas, not pixels", "They're in 4K", "They're black and white", "That's not true"], explanation: "Vectors recalculate at every size." },
    { kind: "theory", title: "The \"pop\" animation", body: ["The most used motion graphics entrance is the **pop**: the shape starts from **0** and grows to its size, often with a small **bounce** (overshoots and returns)."] },
    { kind: "quiz", question: "A \"pop\" animation starts from a size of…", options: ["0", "100", "1000", "−50"], explanation: "From nothing to full: it appears by growing." },
    { kind: "studio", title: "Draw a star", instructions: "Draw a **star** with the Star tool (**Q** until you find it) in the Composition panel.", goals: ["A **star** shape layer"] },
    { kind: "studio", title: "Make it explode (pop)", instructions: "Animate the **Size** of the **Cheese** shape: keyframe at **0** then to full size (at least 200), with **Easy Ease**.", goals: ["At least 2 **Size** keyframes", "Starts from ~0 and reaches ≥ 200", "With **Easy Ease**"] },
  ] },
  "maschere-matte": { title: "Masks and track matte", summary: "Showing only part of a layer.", steps: [
    { kind: "theory", title: "Masks", body: ["A **mask** is a path drawn on a layer: only the inside stays visible. With **Feather** the edge becomes soft, with **Expansion** the mask grows or shrinks.", "Animating expansion creates a **reveal**: the image opens from the center."] },
    { kind: "quiz", question: "Which mask property makes the edge soft?", options: ["Feather", "Opacity", "Expansion", "Rotation"], explanation: "Feather softens the edge." },
    { kind: "theory", title: "Track matte", body: ["A **track matte** uses one layer (e.g. text) as a mask for the one below: the video shows **inside the letters**. That's the \"image-filled titles\" effect."] },
    { kind: "quiz", question: "You want video showing inside the letters of a title. What do you use?", options: ["A track matte", "A freeze frame", "A null", "An expression"], explanation: "The text acts as a window on the video." },
    { kind: "studio", title: "Spotlight effect", instructions: "On the drone draw an **elliptical mask** (Ellipse tool with the layer selected) and feather it with **Mask Feather** ≥ **60**.", goals: ["An **elliptical mask**", "Feather ≥ **60**"] },
    { kind: "studio", title: "Reveal", instructions: "Now animate the drone's **Mask Expansion**: from very negative (≤ **−200**, mask closed) to **0** or more, so the image opens up.", goals: ["At least 2 **Expansion** keyframes", "From closed (≤ −200) to open (≥ 0)"] },
  ] },
  "parenting": { title: "Parenting", summary: "Linking layers that move together.", steps: [
    { kind: "theory", title: "Parent and child", body: ["With **parenting** a layer (child) follows all movements of another (parent): position, scale, rotation. The child can also have its own movements.", "Done via the **Parent** column in the timeline: dropdown menu or the **pick whip** dragged to the parent."] },
    { kind: "quiz", question: "If you rotate the parent, what does the child do?", options: ["Stays still", "Rotates with the parent", "Disappears", "Duplicates"], explanation: "The child inherits the parent's transformations." },
    { kind: "theory", title: "The null as puppeteer", body: ["Pro trick: link multiple layers to a **null object** and animate only the null. Move, rotate or scale the whole group with one set of keyframes."] },
    { kind: "quiz", question: "You want to move logo, text and bar together. What do you do?", options: ["Link them to a null and animate the null", "Animate each separately", "Export them", "Use a transition"], explanation: "One control for the whole group." },
    { kind: "studio", title: "The arm follows the body", instructions: "The **Body** already moves. Link the **Arm** to the Body as **parent** (Parent column).", goals: ["Arm → parent **Body**"] },
    { kind: "studio", title: "The puppeteer", instructions: "Create a **null object**, link **both the logo and the text** to the null and animate the null's **Rotation** (at least 2 keyframes).", goals: ["A **null object**", "Logo and text are children of the null", "The null rotates (2 keyframes)"] },
  ] },
  "animatori-testo": { title: "Text animators", summary: "Animating letter by letter.", steps: [
    { kind: "theory", title: "Animating text from within", body: ["**Text animators** change properties (opacity, position, tracking…) **letter by letter** using a **range selector** that decides which letters are affected.", "Animating the selector's **End** from 0% to 100% makes letters appear one at a time; animating **Tracking** makes the title \"open up\"."] },
    { kind: "quiz", question: "What does the range selector decide?", options: ["Which letters get animated", "Text color", "Comp duration", "Font"], explanation: "Start, End and Offset choose the letters." },
    { kind: "theory", title: "The opening tracking", body: ["A trailer classic: the title appears with letters **tight** and slowly **widens**. Animate **Tracking** from the animator."] },
    { kind: "quiz", question: "Which property do you animate for a trailer-style \"breathing\" title?", options: ["Tracking", "Layer opacity", "Volume", "Duration"], explanation: "Letters slowly space apart." },
    { kind: "studio", title: "Trailer title", instructions: "Open **Animator 1** on the text and animate **Tracking**: from **0** to at least **200** in 2–4 seconds.", goals: ["At least 2 **Tracking** keyframes", "From ~0 to at least **200**"] },
    { kind: "studio", title: "Letter by letter", instructions: "Now make the text appear letter by letter: animate **Range Selector: End** from **0%** to **100%**.", goals: ["End from **0%**", "…to **100%**"] },
  ] },
  "titoli-cinetici": { title: "Kinetic typography", summary: "Words that follow the voice.", steps: [
    { kind: "theory", title: "Words that move", body: ["**Kinetic typography** makes words appear **in time with the voice**: each word enters when spoken, with different sizes and movements for emphasis.", "Important words are **bigger** and stay longer; connecting words are smaller and faster."] },
    { kind: "quiz", question: "In kinetic typography, how do you emphasize a keyword?", options: ["Bigger with more screen time", "Smaller and faster", "By hiding it", "In gray"], explanation: "Visual hierarchy = meaning hierarchy." },
    { kind: "theory", title: "Staggering", body: ["Entrances should be **staggered**: the second word starts a few frames after the first. In AE just offset layers in time, or use **Animation → Keyframe Assistant → Sequence Layers**."] },
    { kind: "quiz", question: "What does staggering animations mean?", options: ["Starting them one after another", "Starting them all at once", "Deleting them", "Exporting them"], explanation: "A small delay between elements creates rhythm." },
    { kind: "studio", title: "Three words, three times", instructions: "Make the three words **LEARN**, **TO** and **EDIT** enter with a **Scale** pop (from 0 to 100), one **after another**: first keyframes must start at different times (at least 0.2 s apart).", goals: ["All 3 words have a **Scale** pop", "**Staggered** entrances"] },
  ] },
  "typewriter": { title: "Typewriter effect", summary: "Text appearing character by character.", steps: [
    { kind: "theory", title: "One letter at a time", body: ["The **typewriter** effect makes text appear **one character at a time**, as if someone were typing it. Perfect for messages, dates, locations.", "In AE you animate the **range selector End** from 0% to 100% (or use the *Typewriter* preset)."] },
    { kind: "quiz", question: "Which property do you animate for the typewriter effect?", options: ["Range selector End", "Layer scale", "Background color", "Comp duration"], explanation: "From 0% to 100%: letters appear one after another." },
    { kind: "theory", title: "With expressions", body: ["Instead of keyframes you can write an **expression** on the property (Alt+click the stopwatch): for example **linear(time, 0, 2, 0, 100)** takes the value from 0 to 100 in the first 2 seconds."] },
    { kind: "quiz", question: "What does the expression linear(time, 0, 2, 0, 100) do?", options: ["Goes from 0 to 100 in the first 2 seconds", "Loops forever", "Generates random numbers", "Nothing"], explanation: "Converts time 0–2 s into the range 0–100." },
    { kind: "studio", title: "Type the message", instructions: "Make **Hello, I'm Squeak!** appear like a typewriter: **Range End** from **0** to **100%** in at least **1.5 seconds**.", goals: ["Starts at **0%**", "Reaches **100%**", "Lasts at least **1.5 s**"] },
    { kind: "studio", title: "With an expression", instructions: "Do it again **without keyframes**: Alt+click the stopwatch on **Range End** and write an expression with **linear** and **time** (e.g. **linear(time, 0, 2, 0, 100)**).", goals: ["Expression with **linear** and **time**"] },
  ] },
  "lower-third-animato": { title: "Animated lower third", summary: "Smooth entry and exit.", steps: [
    { kind: "theory", title: "How a lower third enters", body: ["An animated lower third usually has **two parts**: a **bar** (shape) that slides in and **text** that appears right after. On exit, the order reverses.", "Entrances last **10–20 frames** and always use **easing**: fast at the start, soft on arrival."] },
    { kind: "quiz", question: "How long does a lower third entrance usually last?", options: ["10–20 frames", "5 seconds", "1 frame", "1 minute"], explanation: "Short and snappy, but soft on arrival." },
    { kind: "theory", title: "Order and rhythm", body: ["Bar first, then text (even just 4–6 frames later): the eye follows the movement and arrives ready to read."] },
    { kind: "quiz", question: "On exit, what disappears first?", options: ["Text, then bar", "Bar, then text", "Everything at once always", "Nothing"], explanation: "Reverse the entry order." },
    { kind: "studio", title: "The bar enters", instructions: "Make the **Bar slide in** from the left: two **Position** keyframes with at least **600 px** of X movement and **Easy Ease**.", goals: ["2 Position keyframes on **Bar**", "Movement ≥ **600 px** in X", "With **Easy Ease**"] },
    { kind: "studio", title: "Then the text", instructions: "Complete: the **text** appears with **Opacity** from 0 to 100 **after** the bar started moving (first keyframe at least 0.1 s after the bar's).", goals: ["Text has a fade (0 → 100)", "Starts after the bar"] },
  ] },
  "logo-animato": { title: "Animated logo", summary: "A 3-second intro for your channel.", steps: [
    { kind: "theory", title: "Short and recognizable", body: ["A channel intro lasts **2–4 seconds**: any longer and people skip. The logo enters with a clear movement, pauses a moment, and the video starts.", "A **bounce** (overshoot) adds character: the logo grows past the final size (110%) and returns to 100%."] },
    { kind: "quiz", question: "How long should a channel intro be?", options: ["2–4 seconds", "30 seconds", "1 minute", "As long as possible"], explanation: "Short: the viewer is there for the content." },
    { kind: "theory", title: "Light and sound", body: ["A subtle **glow**, a flash or a reflection, and especially a **sound** (whoosh, impact) make the intro memorable."] },
    { kind: "quiz", question: "What's overshoot?", options: ["Going past the final value and bouncing back", "Exporting twice", "A render error", "A codec"], explanation: "The bounce that brings movements to life." },
    { kind: "studio", title: "Pop with bounce", instructions: "Animate the logo's **Scale** with **3 keyframes**: **0** → over **105** → about **100** (the bounce).", goals: ["At least **3 Scale** keyframes", "Starts from ~0", "Goes past **105** and ends at ~**100**"] },
    { kind: "studio", title: "Add the glow", instructions: "Make the logo luminous: apply the **Glow** effect (Stylize) and bring the **Glow Radius** to at least **30**.", goals: ["**Glow** with radius ≥ 30"] },
  ] },
  "green-screen": { title: "Green screen", summary: "Keying with chroma key.", steps: [
    { kind: "theory", title: "Chroma key", body: ["You film the subject in front of a **green** (or blue) backdrop, evenly lit. **Chroma key** makes that color transparent and you put another background behind.", "Green is used because it's far from skin tones and sensors are very sensitive to green."] },
    { kind: "quiz", question: "Why is the backdrop green?", options: ["Because it's far from skin tones", "Because directors like it", "Because it's cheaper", "By chance"], explanation: "So the key doesn't eat into the subject." },
    { kind: "theory", title: "Refining the key", body: ["After choosing the key color you adjust **tolerance** and **softness** and remove **spill** (the green reflection on the subject's edges)."] },
    { kind: "quiz", question: "What is spill?", options: ["Green reflection on the subject", "A type of transition", "An audio error", "The key duration"], explanation: "The colored backdrop reflects on the edges: it needs to be neutralized." },
    { kind: "studio", title: "Key out Squeak", instructions: "The **Greenscreen_Squeak** layer is above the drone. Apply **Ultra Key** (Keying) to remove the green, with **Spill Suppression** active.", goals: ["**Ultra Key** on green screen", "Spill Suppression active"] },
    { kind: "studio", title: "Place it in the scene", instructions: "Shrink Squeak (Scale ≤ **70**) and move it to the **right half** of the scene (X > 960).", goals: ["Scale ≤ **70**", "On the right"] },
  ] },
  "tracking": { title: "Motion tracking", summary: "Attaching an element to a moving object.", steps: [
    { kind: "theory", title: "Following the motion", body: ["**Motion tracking** analyzes a point in the image frame by frame and extracts **position** keyframes. Then you \"attach\" a text, logo or effect to that data.", "In AE you apply the data to a **null object**, and parent the elements to the null."] },
    { kind: "quiz", question: "What do you usually apply tracking data to?", options: ["A null object", "Directly to audio", "To the comp", "To the Project panel"], explanation: "The null becomes the point that moves with the object." },
    { kind: "theory", title: "Manual tracking", body: ["When auto-tracking fails, do it manually: position keyframes on the null every few frames, following the object. Slow, but always works."] },
    { kind: "quiz", question: "After tracking, how do you attach text to the null?", options: ["With parenting", "With a transition", "By copying the file", "You can't"], explanation: "The text becomes the null's child and follows it." },
    { kind: "studio", title: "Manual tracking", instructions: "Create a **null object**, give it at least **3 Position keyframes** (one per second) and parent the **text** to the null.", goals: ["Null with **3+ Position** keyframes", "Text follows the null"] },
    { kind: "studio", title: "Link with an expression", instructions: "Alternative to parenting: write on the text's **Position** an expression that reads the null's position, e.g. **thisComp.layer(\"Target\").transform.position**.", goals: ["Expression that reads **Target**"] },
  ] },
  "stabilizzazione": { title: "Stabilization", summary: "Removing shake from handheld footage.", steps: [
    { kind: "theory", title: "The shake", body: ["**Handheld** footage shakes. The **Warp Stabilizer** analyzes the clip and compensates the motion, then **enlarges** the image slightly to hide the moving edges.", "The more **smoothness** you ask for, the more the image is cropped (and loses quality)."] },
    { kind: "quiz", question: "Why does the stabilizer enlarge the image?", options: ["To hide the edges that move", "To increase resolution", "To change format", "It doesn't"], explanation: "Compensating motion leaves empty areas at the edges." },
    { kind: "theory", title: "Don't overdo it", body: ["**20–50%** smoothness is usually enough. At 100% the footage looks \"rubbery\" and very cropped. If the shot is too shaky, better switch to another shot."] },
    { kind: "quiz", question: "What smoothness level is usually reasonable?", options: ["20–50%", "Always 100%", "0%", "500%"], explanation: "Enough to remove the shake without warping." },
    { kind: "studio", title: "Stabilize in Premiere", instructions: "The city footage is shaky. Apply **Warp Stabilizer** (Video Effects → Distort) with **Smoothness** between **20** and **50%**.", goals: ["**Warp Stabilizer** applied", "Smoothness **20–50%**"] },
  ] },
  "blending": { title: "Blending modes", summary: "Screen, multiply and overlay.", steps: [
    { kind: "theory", title: "How layers blend", body: ["The **blending mode** decides how a layer mixes with those below. **Screen** keeps only bright parts: perfect for lights, flames, reflections on black.", "**Multiply** keeps dark parts (shadows, texture on white). **Overlay** increases contrast by blending both."] },
    { kind: "quiz", question: "You have an explosion on a black background. Which mode removes the black?", options: ["Screen", "Multiply", "Normal", "Difference"], explanation: "Screen eliminates black and keeps the light." },
    { kind: "theory", title: "Where to change it", body: ["In AE the **Mode** column in the timeline (press **F4** if you don't see it). In Premiere: **Effect Controls → Opacity → Blend Mode**."] },
    { kind: "quiz", question: "A paper texture on white background: which mode to keep only the dark parts?", options: ["Multiply", "Screen", "Add", "Normal"], explanation: "Multiply eliminates white." },
    { kind: "studio", title: "Warm light on the sea", instructions: "The **Light** layer (orange) covers the entire drone. Set it to **Screen** (or **Add**) mode and lower its **Opacity** to **≤ 60%**.", goals: ["Mode **Screen** or **Add**", "Opacity ≤ **60%**"] },
    { kind: "studio", title: "Embossed text", instructions: "Put the text **WAVE** in **Overlay** mode above the drone: it will look like part of the image.", goals: ["Text in **Overlay**"] },
  ] },
  "particelle": { title: "Particles", summary: "Dust, sparkles and snow.", steps: [
    { kind: "theory", title: "Particle systems", body: ["A **particle system** generates hundreds of small elements (dots, sparkles, flakes) with rules: how many are born, how long they live, where they go, how heavy they are.", "In AE there are **CC Particle World** (built-in) and plugins like **Trapcode Particular**. Used for snow, dust, sparkles, magic."] },
    { kind: "quiz", question: "What controls a particle's \"life\"?", options: ["How long it stays visible before disappearing", "Its color", "Comp format", "Volume"], explanation: "Each particle is born, lives and disappears." },
    { kind: "theory", title: "Hand-made particles", body: ["For a few elements you can do it manually: a few small shapes, duplicated (**Ctrl+D**), with a **wiggle** expression on position to make them float randomly.", "**wiggle(1, 50)**: once per second moves randomly up to 50 pixels."] },
    { kind: "quiz", question: "What does the expression wiggle(2, 30) do?", options: ["Moves randomly 2 times per second up to 30 px", "Rotates 30°", "Doubles the scale", "Stops the layer"], explanation: "Frequency 2, amplitude 30." },
    { kind: "studio", title: "Snowflakes", instructions: "Create at least **5** small shapes (duplicate the **Flake** with **Ctrl+D**) and write a **wiggle** expression on **Position** on at least **3** of them.", hint: "Write the expression on the first flake **before** duplicating: copies inherit it!", goals: ["At least **5** shapes", "**3+** with wiggle on Position"] },
  ] },

  // Section 5
  "proxy": { title: "Proxies", summary: "Editing 4K on any laptop.", steps: [
    { kind: "theory", title: "Lightweight files for editing", body: ["**Proxies** are **lightweight** copies (low resolution, easy codec) of the original heavy files. You edit with proxies, the computer doesn't struggle, and on export Premiere automatically uses the **originals**.", "In Premiere: right-click clips → **Proxy → Create Proxies**, then the **Toggle Proxies** button in the monitor."] },
    { kind: "quiz", question: "On export, Premiere uses…", options: ["The proxies", "The original files", "A random one", "Neither"], explanation: "Proxies are only for comfortable editing." },
    { kind: "theory", title: "Organizing proxies and originals", body: ["Keep proxies and originals in **separate folders** on disk with the **same names**: they'll relink without issues."], tip: "A quick alternative: lower the playback resolution of the Program Monitor to 1/2 or 1/4." },
    { kind: "quiz", question: "Why should proxies and originals have the same names?", options: ["For easy relinking", "To save space", "For color", "Not needed"], explanation: "Linking is based on names." },
    { kind: "studio", title: "Set up the project for proxies", instructions: "Create two bins, **Originals** and **Proxies**, and move **at least 2 videos** into the **Originals** bin.", goals: ["Bin **Originals**", "Bin **Proxies**", "At least 2 videos in Originals"] },
    { kind: "match", title: "Match", pairs: [["Proxy", "Lightweight copy"], ["Original", "Heavy quality file"], ["Export", "Uses originals"], ["1/4", "Reduced playback resolution"]] },
  ] },
  "gestione-progetto": { title: "Project management", summary: "Folders, names and versions.", steps: [
    { kind: "theory", title: "Names that speak", body: ["A good name says **client, project, type and version**: *Pizzeria_Spot30s_v3*. Never *final*, *final2*, *final_REALLY*: after a week nobody knows which is the right one.", "The **version** number increases with every delivery to the client."] },
    { kind: "quiz", question: "Which sequence name is best?", options: ["final_definitive2", "Pizzeria_Spot30s_v3", "Sequence 01", "aaa"], explanation: "Client, format and version: clear forever." },
    { kind: "theory", title: "A structure that repeats", body: ["Every project with the same folders: **01_Video**, **02_Audio**, **03_Graphics**, **04_Export**. You find everything even years later."] },
    { kind: "quiz", question: "Why always use the same folder structure?", options: ["To find everything quickly in every project", "To save space", "It's mandatory", "Not needed"], explanation: "Habit saves time and errors." },
    { kind: "studio", title: "Rename and organize", instructions: "Rename the sequence to **Pizzeria_Spot_v1** (double-click the name in the Project panel) and create an **Export** bin.", goals: ["Sequence **…_v1**", "Bin **Export**"] },
  ] },
  "backup": { title: "Backup", summary: "The 3-2-1 rule.", steps: [
    { kind: "theory", title: "The 3-2-1 rule", body: ["**3** copies of data, on **2** different media, with **1** off-site (cloud or a drive at someone else's place). Drives fail: it's only a matter of when.", "Original footage is the most valuable thing: without it, the project can't be redone."] },
    { kind: "quiz", question: "What does the \"1\" in the 3-2-1 rule mean?", options: ["One off-site copy", "One single drive", "One backup per year", "One file"], explanation: "If the house or office has a problem, that copy survives." },
    { kind: "theory", title: "Save often", body: ["**Ctrl+S** every few minutes, and **Save As** with a new version before major changes. Premiere also makes automatic saves in the *Auto-Save* folder."] },
    { kind: "quiz", question: "Before a drastic change, what should you do?", options: ["Save a new version of the project", "Close without saving", "Delete the footage", "Nothing"], explanation: "So you can go back at any time." },
    { kind: "studio", title: "Version and save", instructions: "Make a change (cut the clip with **Ctrl+K**), rename the sequence to **…_v2** and **save** with **Ctrl+S**.", goals: ["A change was made", "Sequence **…_v2**", "Project **saved**"] },
  ] },
  "collaborazione": { title: "Collaboration", summary: "Reviews and client feedback.", steps: [
    { kind: "theory", title: "Reviews", body: ["The client watches a **review copy** and leaves **comments with timecodes** (\"at 00:00:12 remove the text\"). Tools like Frame.io connect comments directly to the timeline.", "Each round of corrections is a **revision**: the quote should state how many are included (usually 2)."] },
    { kind: "quiz", question: "Why should comments have timecodes?", options: ["To know exactly where to make changes", "To make the video longer", "For color", "Not needed"], explanation: "\"The part in the middle\" is vague; 00:00:12:05 isn't." },
    { kind: "theory", title: "Markers as reminders", body: ["Turn each comment into a **marker** in the timeline with the text in the **Comments** field (double-click the marker). Then resolve them one by one."] },
    { kind: "quiz", question: "How do you turn a client comment into a timeline reminder?", options: ["With a marker with comment", "With a transition", "With a new sequence", "You can't"], explanation: "Double-click the marker → Comments." },
    { kind: "studio", title: "Annotate the corrections", instructions: "The client asked for two changes. Add **2 markers** and write a **comment** in each (double-click the marker).", goals: ["At least **2 markers**", "With a written **comment**"] },
  ] },
  "consegna-cliente": { title: "Client delivery", summary: "Deadlines, revisions and invoicing.", steps: [
    { kind: "theory", title: "Before you start", body: ["A clear **quote** avoids disputes: what you'll do, by when, **how many revisions**, delivery formats, and the price (with deposit, often 30–50%).", "Extra revisions are charged separately: write it upfront."] },
    { kind: "quiz", question: "What should a quote contain?", options: ["Work, deadlines, revisions included, formats and price", "Only the price", "Only the date", "Nothing, just your word"], explanation: "Everything in writing: it protects both parties." },
    { kind: "theory", title: "The review copy", body: ["For reviews send a **light** copy (720p, low bitrate) with **burned-in timecode** (Timecode effect): the client can cite the exact spot and can't use the video without paying."] },
    { kind: "quiz", question: "Why burn timecode on the review copy?", options: ["For precise references and to protect the work", "For looks", "For higher quality", "For color"], explanation: "Double benefit: precision and protection." },
    { kind: "studio", title: "Review copy", instructions: "Prepare the copy for the client: apply the **Timecode** effect (Video) to a clip, then export in **H.264** at **1280×720** with bitrate **≤ 5 Mbps**.", hint: "Even better: put the Timecode on an **adjustment layer** on V2, so it covers the whole sequence.", goals: ["**Timecode** burned in", "Export **1280×720** H.264", "Bitrate ≤ **5 Mbps**"] },
  ] },
  "verticale": { title: "The 9:16 format", summary: "Reframing a horizontal video.", steps: [
    { kind: "theory", title: "From horizontal to vertical", body: ["To turn a 16:9 video into 9:16 create a **1080×1920** sequence and **enlarge** the clip (scale ~178%) until it fills the screen. Then **reframe**: move the image to keep the subject centered.", "Premiere also has **Auto Reframe**, which follows the subject automatically."] },
    { kind: "quiz", question: "What scale is needed to fill 1080×1920 with a 1920×1080 video?", options: ["About 100%", "About 178%", "About 50%", "About 300%"], explanation: "1920 / 1080 ≈ 1.78: you need to enlarge the height to 1920." },
    { kind: "theory", title: "Following the subject", body: ["If the subject moves, animate **Position** with a few keyframes: a manual reframe, more precise than auto."] },
    { kind: "quiz", question: "The subject leaves the vertical frame. What do you animate?", options: ["Position", "Volume", "Duration", "Saturation"], explanation: "You move the image within the frame." },
    { kind: "studio", title: "Reframe to vertical", instructions: "Create a **1080×1920** sequence, put the **interview** in it, scale it to at least **175%** and animate **Position** with at least **2 keyframes** to keep the face centered.", goals: ["Sequence **1080×1920** with interview", "Scale ≥ **175%**", "Position animated"] },
  ] },
  "hook": { title: "The first 3-second hook", summary: "Grabbing the viewer immediately.", steps: [
    { kind: "theory", title: "Three seconds to convince", body: ["On social media people decide in **1–3 seconds** whether to stay. The first moments need **movement**, a **question** or a **promise** (\"Here's how I…\"), and often large text.", "Never start with slow logos, greetings or static pans."] },
    { kind: "quiz", question: "Which opening works best for a Reel?", options: ["A logo spinning for 5 seconds", "The most spectacular action with text", "A static pan", "\"Hey everyone, today…\" slowly"], explanation: "The best right away: scrollers must stop." },
    { kind: "theory", title: "The \"flash forward\" trick", body: ["Take the best moment of the video and **put it at the beginning** as a preview, then restart from the top: the viewer stays to see how they got there."] },
    { kind: "quiz", question: "What's a flash forward in the opening?", options: ["Showing the best moment at the start", "A type of LUT", "An audio effect", "A transition"], explanation: "A visual promise of what's to come." },
    { kind: "studio", title: "An opening that hooks", instructions: "This video starts with 5 seconds of static sunset. Put a dynamic clip (**city** or **drone**) **at the beginning**, lasting **≤ 3 s**, and add **text** appearing within the first second.", goals: ["Opens with city or drone", "First clip ≤ **3 s**", "Text within the first second"] },
  ] },
  "sottotitoli-dinamici": { title: "Dynamic subtitles", summary: "Highlighted words on the beat.", steps: [
    { kind: "theory", title: "The creator style", body: ["**Dynamic subtitles** show **a few words at a time** (1–3), large, centered, with the keyword **colored** and a small scale **pop** on each entry.", "They keep eyes glued to the screen and work even without sound."] },
    { kind: "quiz", question: "How many words at a time in a dynamic subtitle?", options: ["1–3", "The whole sentence", "A paragraph", "None"], explanation: "Few and large, in time with the voice." },
    { kind: "theory", title: "Highlighting", body: ["The most important word in the sentence gets the **brand color** (yellow, green…) or a larger size. The rest stays white with stroke."] },
    { kind: "quiz", question: "How do you highlight the keyword?", options: ["With a different color or larger size", "By hiding it", "In small gray", "You don't highlight"], explanation: "Color guides attention." },
    { kind: "studio", title: "Words that pop", instructions: "There are 3 words. Give **all** a **Scale** pop (from ~0 to 100) and color **one** word a different color from white (in the **Character** panel).", goals: ["Scale pop on all 3", "One word **colored**"] },
  ] },
  "ritmo-reel": { title: "Reel rhythm", summary: "Fast cuts on the music.", steps: [
    { kind: "theory", title: "Fast, but not random", body: ["A dynamic reel changes shots every **0.5–1.5 seconds**, but **on the music beats**: the rhythm should be felt, not confused.", "Vary the duration: a few super-fast cuts, then a shot that breathes, then fast again."] },
    { kind: "quiz", question: "How often do you cut in a dynamic reel?", options: ["0.5–1.5 seconds", "10 seconds", "1 minute", "Never"], explanation: "Fast but readable." },
    { kind: "theory", title: "Markers first", body: ["Mark the beats with **M** during playback, then edit snapping to the markers. Same method as the rhythm lesson, just faster."] },
    { kind: "quiz", question: "What's the fastest way to cut to the beat?", options: ["Markers on beats + snapping", "Eyeballing", "Random cuts", "A 2-hour tutorial"], explanation: "The marker grid does half the work." },
    { kind: "studio", title: "Reel on the beat", instructions: "Markers are on the beats (every 0.8 s). Edit **at least 6 pieces** on V1, each **≤ 1.3 s**, no gaps, with at least **4 cuts** on markers.", hint: "Razor (**C**) on each marker, then ripple delete excess pieces.", goals: ["At least **6 pieces**", "Each ≤ **1.3 s**", "No gaps", "**4+ cuts** on markers"] },
  ] },
  "thumbnail": { title: "The thumbnail", summary: "The cover that makes people click.", steps: [
    { kind: "theory", title: "The cover sells the video", body: ["On YouTube the **thumbnail** decides whether someone clicks. Rules: expressive **face**, **few words** (max 3–4) **very large**, **contrasting** colors, readable even tiny.", "Format: **1280×720** (16:9)."] },
    { kind: "quiz", question: "How many words maximum on a good thumbnail?", options: ["3–4", "20", "A paragraph", "No limit"], explanation: "Must be readable in an instant, even on a phone." },
    { kind: "theory", title: "Text that pops", body: ["Text has a thick **stroke** or strong **shadow**, so it reads on any background. Yellow, white and red are the classics."] },
    { kind: "quiz", question: "What size is a YouTube thumbnail?", options: ["1280×720", "500×500", "1080×1920", "4000×4000"], explanation: "16:9 at 1280×720." },
    { kind: "studio", title: "Create the thumbnail", instructions: "Create a comp **1280×720** called **Thumbnail** and add **text** large (size ≥ **120**) with **stroke** or **shadow** enabled (Character panel).", goals: ["Comp **1280×720**", "Large text (≥ 120)", "With stroke or shadow"] },
  ] },
  "brief": { title: "The brief", summary: "Understanding what the client really wants.", steps: [
    { kind: "theory", title: "The right questions", body: ["The **brief** is the document (or conversation) where the client explains what they want. Your job is to ask the right questions: the video's **goal**, the **audience**, **where** it'll be published, **duration**, **style** (with examples!), **deadline**, **budget**.", "A vague brief produces a wrong video and lots of revisions."] },
    { kind: "quiz", question: "Which question is NOT essential in a brief?", options: ["Where the video will be published", "The audience", "Your mascot's favorite color", "The deadline"], explanation: "The others affect format, style and timing." },
    { kind: "theory", title: "Our brief", body: ["**Client**: Pizzeria da Squeak. **Goal**: bring people in Saturday night. **Where**: Instagram feed (**4:5**, 1080×1350). **Duration**: 15–30 s. **Style**: warm, fast, inviting. **Deadline**: Friday."] },
    { kind: "quiz", question: "The video is for the Instagram feed in 4:5. What sequence do you create?", options: ["1080×1350", "1920×1080", "1080×1920", "1280×720"], explanation: "4:5 = 1080 wide by 1350 tall." },
    { kind: "studio", title: "Set up the project from the brief", instructions: "Create the sequence for the brief: **1080×1350**, **30 fps**, named **Spot_Pizzeria**.", goals: ["Sequence **1080×1350**", "At **30 fps** (or 29.97)", "Named **Spot_Pizzeria**"] },
  ] },
  "selezione": { title: "Footage selection", summary: "Choosing the best shots.", steps: [
    { kind: "theory", title: "Watch everything, keep little", body: ["Before editing you **watch all** the footage and pick the best parts: in focus, well exposed, with the right action. Usually you use **10–20%** of what was shot.", "Put the picks in a **Selection** bin and mark the good moments with I/O or markers."] },
    { kind: "quiz", question: "What percentage of footage usually ends up in the edit?", options: ["10–20%", "100%", "90%", "1%"], explanation: "You shoot a lot to choose the best." },
    { kind: "theory", title: "What to discard", body: ["Out of focus, shaky, overexposed, people looking at camera by mistake, ruined audio. And duplicate takes: keep only the best."] },
    { kind: "quiz", question: "Which shot do you discard first?", options: ["The out of focus one", "The one with the best action", "The well-exposed one", "The best detail"], explanation: "Focus can't be recovered." },
    { kind: "studio", title: "The picks bin", instructions: "Create a **Selection** bin and put the **3 best clips** for a food spot (suggestion: coffee, city and interview).", goals: ["Bin **Selection**", "At least **3 clips** inside", "**Coffee** is there"] },
  ] },
  "assemblaggio": { title: "Assembly", summary: "The first rough edit.", steps: [
    { kind: "theory", title: "The rough cut", body: ["The **assembly** (rough cut) puts the picks in story order, **without worrying about details**. It's to see if the structure works.", "It's normal for it to be too long: you shorten it later."] },
    { kind: "quiz", question: "What's the rough edit for?", options: ["To check the story structure", "For color grading", "For master export", "For audio mixing"], explanation: "Structure first, details later." },
    { kind: "theory", title: "Spot structure", body: ["**Hook** (strong image) → **problem/desire** (Saturday night, hungry) → **solution** (the pizzeria, the food) → **call to action** (come!)."] },
    { kind: "quiz", question: "What's the last part of a spot?", options: ["The call to action", "The hook", "The problem", "Opening titles"], explanation: "Tell the viewer what to do: \"Book now\"." },
    { kind: "studio", title: "Assemble the rough cut", instructions: "Assemble the spot: at least **4 different clips** on V1 with no gaps, **music** on A2 under the whole video, total duration between **15** and **30 s**.", goals: ["At least **4 different clips** on V1", "No gaps", "Music under the video", "Duration **15–30 s**"] },
  ] },
  "fine-cut": { title: "From rough cut to fine cut", summary: "Refining rhythm and story.", steps: [
    { kind: "theory", title: "Cut, cut, cut", body: ["From the rough cut to the **fine cut** you mainly work by **removing**: every shot should last only as long as it needs. If a scene adds nothing, it goes.", "Fix the **cuts** (match cuts, J/L-cuts), close the **gaps**, check the **rhythm**."] },
    { kind: "quiz", question: "What's the main activity in the rough-to-fine transition?", options: ["Removing the unnecessary", "Adding effects", "Extending scenes", "Changing format"], explanation: "The best edit is often the shortest." },
    { kind: "theory", title: "Watch it as a viewer", body: ["Rewatch the edit from the start without stopping, like a viewer would. Where you get bored, cut. Where you don't understand, add."] },
    { kind: "quiz", question: "Rewatching the video you get bored in the middle. What do you do?", options: ["Shorten that part", "Add a cube transition", "Turn up the music", "Nothing"], explanation: "Boredom is the signal to cut." },
    { kind: "studio", title: "Refine the rough cut", instructions: "This rough cut has gaps and shots that are too long. Make it a fine cut: **no gaps**, every clip **≤ 4 s**, total duration **≤ 16 s**.", hint: "Trim each clip with the **Ripple tool (B)**: shorten and gaps close by themselves.", goals: ["No gaps", "Every clip ≤ **4 s**", "Duration ≤ **16 s**"] },
  ] },
  "finalizzazione": { title: "Color, audio and export", summary: "Closing and delivering the project.", steps: [
    { kind: "theory", title: "The last mile", body: ["The **finishing**: color correction and look (**consistent** across all clips), audio mix (voice clear, music underneath, no peaks above **−1 dB**), titles checked, and **export** in the brief's format.", "Before delivery: rewatch **everything** once, with headphones."] },
    { kind: "quiz", question: "Before delivering, what do you always do?", options: ["Rewatch everything with headphones", "Nothing, deliver right away", "Delete the project", "Change the format"], explanation: "The final check saves from embarrassing errors." },
    { kind: "theory", title: "The delivery package", body: ["To the client: the **final** file (H.264 for social), possibly a **master** of high quality and, if agreed, versions in various formats (9:16, 1:1)."] },
    { kind: "quiz", question: "What does a typical client delivery contain?", options: ["The final file plus any versions and master", "Only the Premiere project", "Raw footage", "Nothing"], explanation: "What was agreed in the quote." },
    { kind: "studio", title: "Color and audio", instructions: "Final touches: apply **Lumetri Color** to at least **2 clips** (with **Contrast** ≥ **+10**) and bring the **music** between **−22** and **−14 dB**.", goals: ["Lumetri on **2+ clips** (contrast ≥ +10)", "Music **−22…−14 dB**"] },
    { kind: "studio", title: "Deliver!", instructions: "Export the finished spot for the feed: **H.264**, **1080×1350**, bitrate between **8** and **20 Mbps**. Congratulations: you've finished the course!", goals: ["**H.264**", "**1080×1350**", "Bitrate **8–20 Mbps**"] },
    { kind: "match", title: "Match", pairs: [["Brief", "What the client wants"], ["Rough cut", "First structure"], ["Fine cut", "Refined rhythm"], ["Delivery", "Final files to client"]] },
  ] },
};

export default en;
