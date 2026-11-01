import type { LessonTranslations } from "./types";

const es: LessonTranslations = {
  "primo-taglio": {
    title: "Tu primer corte",
    summary: "Importa un clip, córtalo y reproduce el resultado.",
    steps: [
      { kind: "theory", title: "¿Qué es un corte?", body: [
        "Editar es elegir **qué** mostrar y **cuándo**. El gesto más simple es el **corte**: dividir un clip en dos partes y quitar lo que sobra.",
        "En Premiere Pro el instrumento principal es la **Cuchilla (C)**: haz clic en un punto de la línea de tiempo y el clip se divide en dos.",
      ] },
      { kind: "quiz", question: "¿Qué hace la herramienta Cuchilla?", options: ["Divide un clip en dos", "Borra todo el clip", "Añade una transición", "Duplica el clip"], explanation: "La cuchilla corta en el punto exacto donde haces clic." },
      { kind: "editor", instructions: "Abre el clip en la **Línea de tiempo**, mueve el cabezal de reproducción al segundo **2** y presiona **C** para cortar. Luego selecciona la segunda parte y presiona **Suprimir**." },
    ],
  },
  "crea-sequenza": {
    title: "Crear una secuencia",
    summary: "Secuencia, línea de tiempo y ajustes básicos.",
    steps: [
      { kind: "theory", title: "La secuencia", body: [
        "Una **secuencia** es el lienzo donde organizas los clips. Tiene una **resolución** (por ejemplo 1920×1080), una **velocidad de fotogramas** (fps) y **pistas** de audio y vídeo.",
        "Puedes crearla manualmente (**Archivo → Nueva → Secuencia**) o arrastrar un clip al panel de la línea de tiempo: Premiere la crea automáticamente con los mismos ajustes del clip.",
      ] },
      { kind: "quiz", question: "¿Cuál es la forma más rápida de crear una secuencia con los ajustes correctos?", options: ["Arrastrar un clip a la línea de tiempo", "Escribir los ajustes a mano", "Exportar primero", "Renombrar un clip"], explanation: "La secuencia hereda resolución, fps y códec del clip." },
      { kind: "theory", title: "Las pistas", body: [
        "**V1, V2, V3…** son pistas de vídeo: la de arriba cubre la de abajo. **A1, A2…** son pistas de audio: se mezclan juntas.",
      ] },
      { kind: "quiz", question: "Si pones un título en V2 y el vídeo en V1, ¿qué ves?", options: ["Solo el vídeo", "Solo el título", "El título sobre el vídeo", "Nada"], explanation: "V2 está sobre V1: se ven ambos, con V2 encima." },
      { kind: "studio", title: "Crea tu primera secuencia", instructions: "Arrastra el clip **Atardecer** al panel de la línea de tiempo vacío. Premiere crea la secuencia automáticamente.", goals: ["Secuencia creada", "Clip **Atardecer** en V1"] },
    ],
  },
  "importare": {
    title: "Importar archivos",
    summary: "Traer vídeos, audio e imágenes al proyecto.",
    steps: [
      { kind: "theory", title: "El panel Proyecto", body: [
        "Todo material que quieras usar debe estar en el **panel Proyecto**: vídeos, audio, imágenes, gráficos. El atajo es **Ctrl+I** (Importar).",
        "Los archivos **no se copian** dentro de Premiere: el proyecto solo contiene **enlaces**. Si mueves o renombras el archivo original, Premiere lo pierde (medios *offline*).",
      ], terms: [{ term: "Medios offline", def: "Premiere ya no encuentra el archivo original" }] },
      { kind: "quiz", question: "¿Qué ocurre si mueves el archivo original a otra carpeta?", options: ["Nada", "Premiere lo pierde (medios offline)", "El vídeo se exporta solo", "La calidad mejora"], explanation: "Premiere apunta al archivo: si lo mueves, el enlace se rompe." },
      { kind: "theory", title: "Organizar con carpetas", body: [
        "Crea **carpetas** (bins) en el panel Proyecto: *Vídeo*, *Audio*, *Gráficos*. Te ahorrarás buscadas cuando el proyecto crezca.",
      ] },
      { kind: "quiz", question: "¿Por qué organizar los archivos en carpetas dentro del proyecto?", options: ["Para encontrar todo más rápido", "Para mejorar la calidad", "Para exportar más rápido", "No es necesario"], explanation: "En un proyecto grande con decenas de archivos, el orden salva." },
      { kind: "studio", title: "Importa y organiza", instructions: "Importa al menos **3 archivos** (Ctrl+I) y distribúyelos en **2 carpetas** diferentes en el panel Proyecto.", goals: ["Al menos **3 archivos** importados", "Al menos **2 carpetas**"] },
    ],
  },
  "monitor": {
    title: "El monitor fuente",
    summary: "Ver el material antes de ponerlo en la línea de tiempo.",
    steps: [
      { kind: "theory", title: "Ver antes de editar", body: [
        "Haz doble clic en un clip del panel Proyecto y se abre en el **Monitor Fuente**: una ventana de previsualización donde ves el material **sin** ponerlo en la línea de tiempo.",
        "Desde aquí puedes elegir solo la parte que te interesa (con In y Out) y arrastrarla a la línea de tiempo. Así trabajas más rápido, sin material inútil en el medio.",
      ] },
      { kind: "quiz", question: "¿Para qué sirve el Monitor Fuente?", options: ["Para ver y seleccionar una parte del clip antes de editarlo", "Para exportar", "Para añadir efectos", "Para grabar audio"], explanation: "Es tu mesa de luz: miras antes de decidir." },
      { kind: "theory", title: "Mark In y Mark Out", body: [
        "**I** marca el punto de **inicio** (Mark In), **O** el punto **final** (Mark Out). Solo la parte entre In y Out se insertará en la línea de tiempo.",
      ] },
      { kind: "quiz", question: "Has marcado In en el segundo 2 y Out en el segundo 5. ¿Cuánto dura la parte seleccionada?", options: ["2 segundos", "3 segundos", "5 segundos", "7 segundos"], explanation: "De 2 a 5 = 3 segundos justos." },
      { kind: "studio", title: "Selecciona la mejor parte", instructions: "Abre un clip en el Monitor Fuente, marca **In** y **Out** para seleccionar entre **2** y **5 segundos** de material, luego arrástralo a la línea de tiempo.", goals: ["Clip abierto en el **Monitor Fuente**", "In y Out marcados", "Duración **2-5 s**"] },
    ],
  },
  "in-out": {
    title: "In & Out en la línea de tiempo",
    summary: "Marcar la zona de trabajo en la secuencia.",
    steps: [
      { kind: "theory", title: "In y Out en la secuencia", body: [
        "**I** y **O** también funcionan directamente en la **línea de tiempo**: marcan el **área de trabajo**, es decir la parte que se exportará, reproducirá en bucle o sustituirá.",
        "Recuerda eliminarlos cuando termines (**Alt+I** quita In, **Alt+O** quita Out) o la exportación cortará la secuencia.",
      ] },
      { kind: "quiz", question: "Has dejado un In al segundo 10 en la secuencia y exportas. ¿Qué pasa?", options: ["Se exporta todo", "Solo se exporta desde el segundo 10 en adelante", "No se exporta nada", "Se duplica el vídeo"], explanation: "La exportación respeta In/Out de la secuencia." },
      { kind: "studio", title: "Exporta solo una parte", instructions: "En la línea de tiempo, marca **In** y **Out** para seleccionar solo los primeros **3-5 segundos** de la secuencia.", goals: ["In en la secuencia", "Out en la secuencia", "Rango **3-5 s**"] },
    ],
  },
  "inserisci-sovrascrivi": {
    title: "Insertar y sobrescribir",
    summary: "Dos formas de añadir un clip a la línea de tiempo.",
    steps: [
      { kind: "theory", title: "Insertar (,)", body: [
        "**Insertar** (tecla **,**) pone el clip en la posición del cabezal y **desplaza** todo lo que viene después: nada se borra, la secuencia se alarga.",
        "Útil cuando quieres añadir una toma en medio de una secuencia ya montada.",
      ] },
      { kind: "quiz", question: "Insertas un clip de 3 segundos en el medio de la secuencia. ¿Qué pasa?", options: ["Los clips siguientes se desplazan 3 segundos", "Los clips siguientes se borran", "Nada cambia", "El clip se pone al final"], explanation: "Insertar empuja hacia adelante: nada se pierde." },
      { kind: "theory", title: "Sobrescribir (.)", body: [
        "**Sobrescribir** (tecla **.**) pone el clip en la posición del cabezal y **reemplaza** lo que hay debajo: no desplaza nada, la secuencia mantiene la misma duración.",
      ] },
      { kind: "quiz", question: "¿Cuándo conviene sobrescribir en vez de insertar?", options: ["Cuando quieres sustituir una toma sin cambiar la duración total", "Nunca", "Para importar", "Para exportar"], explanation: "Si la duración total es fija (ej.: un anuncio de 30s), sobrescribir no la altera." },
      { kind: "studio", title: "Insertar, luego sobrescribir", instructions: "**Inserta** un clip con **,** (la secuencia se alarga), luego **sobrescribe** otro con **.** encima del primero (la duración no cambia).", goals: ["Al menos una **inserción**", "Al menos una **sobreescritura**"] },
    ],
  },
  "trim": {
    title: "Recortar",
    summary: "Acortar o alargar un clip desde el borde.",
    steps: [
      { kind: "theory", title: "Recortar un borde", body: [
        "**Recortar** (trim) significa arrastrar el borde de un clip para acortarlo o alargarlo. La parte eliminada no se borra: se puede recuperar alargando el clip de nuevo.",
        "Con la herramienta de selección (**V**) agarra el borde derecho de un clip y arrástralo hacia la izquierda: el clip se acorta.",
      ] },
      { kind: "quiz", question: "Recortas un clip desde la derecha. ¿Se pierde material?", options: ["Sí, permanentemente", "No, puedes alargar el clip de nuevo", "Solo si exportas", "Depende del códec"], explanation: "El trim es no destructivo: el archivo original queda intacto." },
      { kind: "studio", title: "Acorta el clip", instructions: "Arrastra el **borde derecho** del clip en la línea de tiempo para **acortarlo** al menos **1 segundo**.", goals: ["Clip acortado al menos **1 s**"] },
    ],
  },
  "ripple-roll": {
    title: "Ripple y Roll",
    summary: "Dos herramientas de recorte avanzado.",
    steps: [
      { kind: "theory", title: "Edición Ripple (B)", body: [
        "La **Edición Ripple** (**B**) recorta un borde y **cierra el hueco** automáticamente: todo lo que viene después se desplaza. Perfecta para eliminar rápidamente partes sin dejar espacios vacíos.",
      ] },
      { kind: "quiz", question: "¿Cuál es la diferencia entre un recorte normal y un Ripple?", options: ["El Ripple cierra el hueco automáticamente", "No hay diferencia", "El Ripple añade una transición", "El Ripple duplica el clip"], explanation: "Ripple = recorte + desplazamiento, en un solo gesto." },
      { kind: "theory", title: "Edición Roll (N)", body: [
        "La **Edición Roll** (**N**) mueve el **punto de corte** entre dos clips: uno se acorta y el otro se alarga de la misma cantidad. La duración total no cambia.",
      ] },
      { kind: "quiz", question: "¿Cuándo usarías Roll en vez de Ripple?", options: ["Cuando la duración total de la secuencia debe quedarse igual", "Nunca", "Solo para audio", "Para importar"], explanation: "Roll es ideal para ajustar un corte sin alterar la duración." },
      { kind: "studio", title: "Prueba ambas", instructions: "Usa la **Edición Ripple (B)** para acortar un clip (el hueco se cierra), luego la **Edición Roll (N)** para mover un punto de corte entre dos clips.", goals: ["Al menos un **Ripple**", "Al menos un **Roll**"] },
    ],
  },
  "slip-slide": {
    title: "Slip y Slide",
    summary: "Cambiar el contenido o la posición sin alterar la duración.",
    steps: [
      { kind: "theory", title: "Slip (Y)", body: [
        "**Slip** (**Y**) cambia la parte **visible** del clip sin mover su posición ni duración en la línea de tiempo. Imagina una ventana que se desliza sobre el metraje: ves una parte diferente, pero la ventana no se mueve.",
      ] },
      { kind: "quiz", question: "¿Qué hace Slip?", options: ["Cambia qué parte del clip se ve, sin moverlo", "Mueve el clip a otra posición", "Borra el clip", "Cambia la velocidad"], explanation: "La posición en la línea de tiempo es fija, el contenido visible se desliza." },
      { kind: "theory", title: "Slide (U)", body: [
        "**Slide** (**U**) mueve el clip entero en la línea de tiempo, pero **recorta los clips adyacentes** para compensar: la duración total no cambia.",
      ] },
      { kind: "quiz", question: "¿Cuál es la diferencia entre Slide y arrastrar?", options: ["Slide recorta los clips adyacentes automáticamente", "No hay diferencia", "Slide borra el clip", "Slide cambia el audio"], explanation: "Slide mantiene la duración total intacta." },
      { kind: "studio", title: "Prueba Slip y Slide", instructions: "Usa **Slip (Y)** para cambiar la parte visible de un clip, luego **Slide (U)** para mover un clip entre otros dos.", goals: ["Al menos un **Slip**", "Al menos un **Slide**"] },
    ],
  },
  "snapping-marker": {
    title: "Snapping y marcadores",
    summary: "Imán automático y puntos de referencia.",
    steps: [
      { kind: "theory", title: "Snapping (S)", body: [
        "El **Snapping** (tecla **S** para activar/desactivar) hace que los clips se **enganchen** automáticamente a otros clips, al cabezal o a los marcadores. Evita micro-huecos que causan flashes negros.",
      ] },
      { kind: "quiz", question: "¿Para qué sirve el Snapping?", options: ["Para que los clips se enganchen sin dejar huecos", "Para ralentizar el vídeo", "Para exportar más rápido", "Para añadir música"], explanation: "Imán activo = cero huecos accidentales." },
      { kind: "theory", title: "Marcadores (M)", body: [
        "Un **marcador** es un punto de referencia en la línea de tiempo o en un clip. Presiona **M** para poner uno. Son perfectos para marcar los tiempos de la música o apuntar notas.",
      ] },
      { kind: "quiz", question: "¿Cuándo conviene poner marcadores?", options: ["En los beats de la música para editar a ritmo", "Solo al exportar", "Nunca", "Solo para audio"], explanation: "Marcadores en los beats → cortar en los beats → el vídeo tiene ritmo." },
      { kind: "studio", title: "Edita a ritmo", instructions: "Escucha la **música** y pon al menos **4 marcadores** en los tiempos fuertes (beats), luego corta los clips en los marcadores.", goals: ["Al menos **4 marcadores**", "Cortes en los marcadores"] },
    ],
  },
  "scorciatoie": {
    title: "Atajos esenciales",
    summary: "Las 10 teclas que te hacen el doble de rápido.",
    steps: [
      { kind: "theory", title: "Manos en el teclado", body: [
        "Los editores profesionales casi nunca usan el ratón para comandos básicos. **V** (selección), **C** (cuchilla), **B** (ripple), **I/O** (in/out), **Espacio** (play/stop), **J-K-L** (atrás-pausa-adelante): estas pocas teclas cubren el 90% de las acciones.",
      ] },
      { kind: "quiz", question: "¿Qué hacen las teclas J, K y L?", options: ["Reproducir atrás, pausa e reproducir adelante", "Cortar, copiar y pegar", "Importar, exportar y guardar", "Nada"], explanation: "J-K-L: el trío más rápido para navegar." },
      { kind: "theory", title: "Barra espaciadora y Enter", body: [
        "**Espacio** reproduce/pausa. **Enter** (o **Intro**) lanza un render de la zona de trabajo (la barra verde/roja sobre la línea de tiempo).",
      ] },
      { kind: "quiz", question: "La barra sobre la línea de tiempo es roja. ¿Qué significa?", options: ["Hay que renderizar para una reproducción fluida", "El proyecto está dañado", "El audio está silenciado", "Es un marcador"], explanation: "Rojo = la reproducción puede saltar; Enter resuelve." },
      { kind: "match", title: "Empareja", pairs: [["V", "Selección"], ["C", "Cuchilla"], ["B", "Edición Ripple"], ["I / O", "In / Out"]] },
    ],
  },
  "livelli-db": {
    title: "Niveles de audio en dB",
    summary: "Qué significan los números del mezclador.",
    steps: [
      { kind: "theory", title: "Decibelios (dB)", body: [
        "El volumen en edición se mide en **dB** (decibelios). **0 dB** es el máximo antes de la **distorsión** (clipping). Los diálogos suelen estar entre **−12** y **−6 dB**, la música de fondo entre **−20** y **−14 dB**.",
        "Si los medidores tocan el rojo (**> 0 dB**) el audio distorsiona: baja el nivel o usa el **Limiter**.",
      ] },
      { kind: "quiz", question: "Los medidores llegan al rojo. ¿Qué está pasando?", options: ["El audio está distorsionando (clipping)", "Todo está bien", "El audio está silenciado", "Falta un plugin"], explanation: "Rojo = el nivel supera 0 dB: distorsión." },
      { kind: "theory", title: "Diálogo vs música", body: [
        "La voz siempre debe estar **más alta** que la música. Si la música está a −20 dB, la voz debería estar al menos entre −12 y −6 dB.",
      ] },
      { kind: "quiz", question: "¿Cuál es un buen nivel para la música de fondo durante un diálogo?", options: ["0 dB", "−6 dB", "−20 dB", "+10 dB"], explanation: "−20 dB: presente pero no molesta la voz." },
      { kind: "studio", title: "Ajusta los niveles", instructions: "Ajusta la **música** entre **−22** y **−14 dB** y la **voz** entre **−12** y **−6 dB** usando las gomas de volumen en la línea de tiempo.", goals: ["Música **−22…−14 dB**", "Voz **−12…−6 dB**"] },
    ],
  },
  "keyframe-volume": {
    title: "Keyframes de volumen",
    summary: "Subir y bajar el volumen en puntos precisos.",
    steps: [
      { kind: "theory", title: "La goma de volumen", body: [
        "Cada clip de audio tiene una línea horizontal: la **goma de volumen**. Puedes añadir **keyframes** (Ctrl+clic) y arrastrarlos para subir o bajar el volumen en puntos precisos.",
      ] },
      { kind: "quiz", question: "¿Cómo se añade un keyframe en la goma de volumen?", options: ["Ctrl+clic en la goma", "Doble clic en el clip", "Arrastrar el clip", "Presionar M"], explanation: "Ctrl+clic crea el punto; luego lo arrastras." },
      { kind: "theory", title: "Bajar la música cuando hablan", body: [
        "Técnica clásica: la música está alta, entra la voz, la música **baja** (con dos keyframes). Cuando la voz calla, la música vuelve a subir. Esto es **ducking** manual.",
      ] },
      { kind: "quiz", question: "¿Cómo se llama la técnica de bajar la música bajo la voz?", options: ["Ducking", "Fading", "Clipping", "Mastering"], explanation: "Ducking: la música se agacha para dejar espacio a la voz." },
      { kind: "studio", title: "Ducking manual", instructions: "Añade al menos **4 keyframes** en la goma de volumen de la música: alta → baja (cuando entra la voz) → baja → alta.", goals: ["Al menos **4 keyframes**", "La música baja durante la voz"] },
    ],
  },
  "ducking": {
    title: "Ducking automático",
    summary: "Premiere baja la música por ti.",
    steps: [
      { kind: "theory", title: "Audio esencial", body: [
        "El panel **Audio Esencial** clasifica las pistas: **Diálogo**, **Música**, **SFX**, **Ambiente**. Si pones la voz como *Diálogo* y la música como *Música*, puedes activar el **Ducking automático**: Premiere detecta cuándo habla alguien y baja la música automáticamente.",
      ] },
      { kind: "quiz", question: "Para usar el ducking automático, ¿qué debes hacer primero?", options: ["Clasificar las pistas en el panel Audio Esencial", "Exportar el proyecto", "Añadir un efecto de vídeo", "Nada"], explanation: "Premiere necesita saber qué es diálogo y qué es música." },
      { kind: "studio", title: "Ducking automático", instructions: "En el panel **Audio Esencial** clasifica la voz como **Diálogo** y la música como **Música**, luego activa el **Ducking** automático.", goals: ["Voz marcada como **Diálogo**", "Música marcada como **Música**", "**Ducking** activado"] },
    ],
  },
  "rumore": {
    title: "Reducción de ruido",
    summary: "Limpiar el audio de soplidos y zumbidos.",
    steps: [
      { kind: "theory", title: "El enemigo invisible", body: [
        "El **ruido** es ese soplido de fondo (aire acondicionado, calle, ventilador) que arruina el audio. El efecto **DeNoise** (Reducción de ruido) del panel Audio Esencial lo reduce sin destruir la voz.",
        "Ajusta la **Cantidad** hasta que el ruido desaparezca pero la voz siga natural. Demasiada reducción crea un efecto \"subacuático\".",
      ] },
      { kind: "quiz", question: "¿Qué ocurre si subes demasiado la reducción de ruido?", options: ["Más calidad", "Efecto subacuático: la voz suena metálica y hueca", "Más ruido", "Nada"], explanation: "Demasiada reducción destruye las frecuencias útiles." },
      { kind: "studio", title: "Limpia el audio", instructions: "Clasifica el clip como **Diálogo** en el panel Audio Esencial y activa **DeNoise** (Reducción de ruido). Ajusta la cantidad hasta que el ruido sea mínimo.", goals: ["Clip como **Diálogo**", "**DeNoise** activado"] },
    ],
  },
  "sfx": {
    title: "Efectos de sonido",
    summary: "Whoosh, impactos y ambiente para dar vida al vídeo.",
    steps: [
      { kind: "theory", title: "El sonido que no se ve", body: [
        "Un buen montaje no es solo imagen: un **whoosh** en una transición rápida, un **impacto** en un corte, un **ambiente** de fondo (ciudad, naturaleza) hacen que el vídeo se **sienta** real.",
        "Los efectos de sonido se encuentran en bibliotecas (gratuitas como Freesound o incluidas en Premiere) y se colocan en pistas de audio separadas de la voz.",
      ] },
      { kind: "quiz", question: "¿Por qué conviene poner los SFX en una pista separada de la voz?", options: ["Para ajustar el volumen independientemente", "Para exportar más rápido", "No es necesario", "Para mejorar la calidad de la voz"], explanation: "Pistas separadas = control independiente del volumen." },
      { kind: "studio", title: "Añade un efecto de sonido", instructions: "Coloca un efecto de sonido (**Whoosh** o cualquier otro) en la pista **A2**, sincronizado con un corte o transición en la línea de tiempo.", goals: ["SFX en **A2**", "**Sincronizado** con un corte"] },
    ],
  },
  "taglio-netto": {
    title: "Corte directo",
    summary: "El corte más simple y potente.",
    steps: [
      { kind: "theory", title: "Cortar sin adornos", body: [
        "El **corte directo** (hard cut) es el paso instantáneo de un clip a otro: sin transición, sin efecto. Es la puntuación básica del montaje, como el punto en una frase.",
        "Funciona bien cuando las dos imágenes son suficientemente **diferentes** (cambio de encuadre, de sujeto, de ángulo). Si son muy similares, el ojo nota un \"salto\" molesto (jump cut).",
      ] },
      { kind: "quiz", question: "¿Cuándo funciona mejor un corte directo?", options: ["Cuando las dos imágenes son similares", "Cuando hay un cambio claro de encuadre o sujeto", "Solo para música", "Nunca"], explanation: "Cuanto mayor sea la diferencia entre los dos clips, más limpio es el corte." },
      { kind: "studio", title: "Tres cortes directos", instructions: "Edita al menos **4 clips** diferentes uno al lado del otro, **sin transiciones**, con cortes directos. Cada clip debe tener un **encuadre diferente** del anterior.", goals: ["Al menos **4 clips**", "Sin transiciones", "Encuadres variados"] },
    ],
  },
  "dissolvenza": {
    title: "Disolvencia cruzada",
    summary: "La transición más utilizada del cine.",
    steps: [
      { kind: "theory", title: "Fundido entre dos clips", body: [
        "La **disolvencia cruzada** (Cross Dissolve) mezcla gradualmente el final de un clip con el inicio del siguiente. Indica paso del tiempo, cambio de lugar o suaviza un corte áspero.",
        "Dura normalmente entre **0,5** y **1 segundo**. Más larga = efecto soñador. En Premiere la encuentras en **Efectos → Transiciones de vídeo → Dissolve → Cross Dissolve**, o arrástrala del panel Efectos.",
      ] },
      { kind: "quiz", question: "¿Qué comunica una disolvencia cruzada al espectador?", options: ["Paso del tiempo o cambio de lugar", "Un error de montaje", "Un efecto especial", "Nada en particular"], explanation: "Es la puntuación 'suave': algo ha cambiado, sin violencia." },
      { kind: "studio", title: "Añade una disolvencia", instructions: "Pon una **Cross Dissolve** entre dos clips en la línea de tiempo. Ajusta la duración a unos **15-25 fotogramas** (0,5–1 s).", goals: ["Al menos una **Cross Dissolve**", "Duración **15-25 fotogramas**"] },
    ],
  },
  "dissolvenza-nero": {
    title: "Fundido a negro",
    summary: "Abrir y cerrar con elegancia.",
    steps: [
      { kind: "theory", title: "La cortina del cine", body: [
        "El **Fundido a negro** (Dip to Black) oscurece la imagen hasta negro, luego se aclara en el clip siguiente. Es el \"telón\" del montaje: perfecto para abrir y cerrar una secuencia.",
        "Al inicio del vídeo se usa el **Fade from Black** (de negro al clip), al final el **Fade to Black** (del clip a negro).",
      ] },
      { kind: "quiz", question: "¿Dónde conviene poner un fundido a negro?", options: ["Al inicio o al final del vídeo, o entre escenas separadas", "En cada corte", "Solo en el audio", "Nunca"], explanation: "Es una puntuación fuerte: úsala con moderación." },
      { kind: "studio", title: "Abre y cierra", instructions: "Pon un **Dip to Black** al **inicio** de la secuencia (como apertura) y otro al **final** (como cierre). Duración entre **15** y **30 fotogramas**.", goals: ["Dip to Black al **inicio**", "Dip to Black al **final**", "Duración **15-30 fotogramas**"] },
    ],
  },
  "j-l-cut": {
    title: "J-cut y L-cut",
    summary: "Cuando el audio y el vídeo cortan en momentos diferentes.",
    steps: [
      { kind: "theory", title: "Audio antes, vídeo después", body: [
        "En un **J-cut** oyes el audio del clip siguiente **antes** de ver su imagen: crea anticipación. En un **L-cut** el audio del clip anterior **continúa** sobre la imagen siguiente: crea continuidad.",
        "En la línea de tiempo la forma parece una J o una L. Para hacerlos: desvincula audio y vídeo (**Shift+clic** en la línea entre ellos) y recorta por separado.",
      ] },
      { kind: "quiz", question: "¿Qué es un J-cut?", options: ["El audio del clip siguiente empieza antes que su imagen", "El vídeo empieza antes que el audio", "Un corte con forma de J en la imagen", "Un efecto especial"], explanation: "Oyes antes de ver: anticipación." },
      { kind: "studio", title: "Crea un J-cut", instructions: "Haz un **J-cut**: extiende el **audio** del segundo clip para que empiece al menos **1 segundo** antes que su **vídeo**.", goals: ["Audio del segundo clip empieza **antes** que su vídeo", "Diferencia de al menos **1 s**"] },
    ],
  },
  "no-transizioni": {
    title: "No abuses de las transiciones",
    summary: "Cuándo usar una transición y cuándo un corte directo.",
    steps: [
      { kind: "theory", title: "Menos es más", body: [
        "Los principiantes ponen transiciones en todas partes: cubos, giros, estrellas. El resultado parece un PowerPoint de 2005.",
        "Regla profesional: **corte directo** en el 90% de los casos. **Disolvencia** para paso del tiempo/lugar. **Dip to black** para abrir/cerrar. Todo lo demás, solo con buena razón.",
      ] },
      { kind: "quiz", question: "¿Cuántas transiciones diferentes se usan en un montaje profesional?", options: ["Cuantas más mejor", "Normalmente 2-3 tipos como máximo", "Exactamente 7", "Ninguna, nunca"], explanation: "Pocas y consistentes: el vídeo se ve profesional." },
      { kind: "quiz", question: "¿Cuándo puede ser apropiada una transición llamativa (giro, zoom)?", options: ["Nunca", "Cuando el estilo del vídeo lo requiere (vlog dinámico, deporte)", "Siempre", "Solo en bodas"], explanation: "El contexto manda: un vídeo de skate puede soportarlas, una entrevista no." },
    ],
  },
  "keyframe": {
    title: "¿Qué es un keyframe?",
    summary: "El concepto que está detrás de toda animación.",
    steps: [
      { kind: "theory", title: "Un valor que cambia en el tiempo", body: [
        "Un **keyframe** es un punto donde fijas un **valor** (posición, escala, opacidad...) en un **momento** preciso. Premiere interpola los valores entre un keyframe y el siguiente: así nace el movimiento.",
        "Por ejemplo: keyframe 1 → posición X=0 al segundo 0; keyframe 2 → posición X=500 al segundo 2. Premiere mueve el clip de 0 a 500 en 2 segundos.",
      ] },
      { kind: "quiz", question: "¿Cuál es el mínimo de keyframes para crear un movimiento?", options: ["1", "2", "5", "10"], explanation: "Dos: inicio y fin. Premiere calcula lo de en medio." },
      { kind: "theory", title: "Cronómetro e diamante", body: [
        "En Controles de efectos, el **cronómetro** activa los keyframes de una propiedad; el **diamante** marca cada punto en la línea de tiempo del panel.",
      ] },
      { kind: "quiz", question: "Has movido el clip pero no has activado el cronómetro. ¿Qué pasa?", options: ["El clip se anima", "El valor cambia permanentemente sin animación", "Premiere se bloquea", "Se añade un efecto"], explanation: "Sin cronómetro activo no hay keyframes: el valor es estático." },
      { kind: "studio", title: "Tu primera animación", instructions: "Anima la **Posición** de un clip: crea el primer keyframe con X a la **izquierda**, avanza 2 segundos y pon otro keyframe con X a la **derecha**. El clip debe moverse.", goals: ["Al menos **2 keyframes** en Posición", "El clip se mueve de izquierda a derecha"] },
    ],
  },
  "posizione-scala": {
    title: "Posición y escala",
    summary: "Mover y redimensionar un clip en el fotograma.",
    steps: [
      { kind: "theory", title: "Posición (x, y)", body: [
        "La **Posición** dice dónde está el centro del clip en el fotograma: **X** (horizontal) e **Y** (vertical). X=960, Y=540 es el centro exacto de un fotograma 1920×1080.",
      ] },
      { kind: "quiz", question: "En una secuencia 1920×1080, ¿cuál es el centro?", options: ["960, 540", "0, 0", "1920, 1080", "500, 500"], explanation: "La mitad de 1920 es 960, la mitad de 1080 es 540." },
      { kind: "theory", title: "Escala (%)", body: [
        "La **Escala** controla el tamaño: **100%** es el tamaño original; por debajo se ve más pequeño (con negro alrededor); por encima se amplía (y pierde algo de calidad si es metraje, no vectorial).",
      ] },
      { kind: "quiz", question: "Pones la escala al 200%. ¿Qué pasa?", options: ["El clip se duplica", "El clip se ve al doble de tamaño (y pierde nitidez)", "No cambia nada", "El clip se borra"], explanation: "Ampliar más allá de 100% funciona, pero cada píxel se estira." },
      { kind: "studio", title: "Zoom al detalle", instructions: "Anima la **Escala** de un clip: de **100%** a al menos **150%** en 2 segundos, para crear un efecto de zoom.", goals: ["Al menos **2 keyframes** en Escala", "De 100% a al menos **150%**"] },
    ],
  },
  "rotazione-opacita": {
    title: "Rotación y opacidad",
    summary: "Girar y hacer desaparecer un clip.",
    steps: [
      { kind: "theory", title: "Rotación (grados)", body: [
        "La **Rotación** gira el clip alrededor de su **punto de anclaje** (centro por defecto). Se mide en grados: 90° = un cuarto de vuelta, 360° = una vuelta completa.",
      ] },
      { kind: "quiz", question: "¿Qué valor de rotación pone el clip al revés?", options: ["90°", "180°", "45°", "360°"], explanation: "180° = media vuelta: el clip queda boca abajo." },
      { kind: "theory", title: "Opacidad (%)", body: [
        "La **Opacidad** controla la transparencia: **100%** completamente visible, **0%** invisible. Animar la opacidad crea **fade in** (de 0 a 100) y **fade out** (de 100 a 0).",
      ] },
      { kind: "quiz", question: "¿Cómo haces un fade out en un título?", options: ["Animas la opacidad de 100% a 0%", "Animas la posición", "Animas la escala", "Borras el clip"], explanation: "De visible (100) a invisible (0): el título se desvanece." },
      { kind: "studio", title: "Fade in giratorio", instructions: "Anima un clip con **Opacidad** de **0** a **100%** y **Rotación** de al menos **45°** a **0°**, en los primeros 1-2 segundos.", goals: ["Opacidad de **0** a **100%**", "Rotación de al menos **45°** a **0°**"] },
    ],
  },
  "interpolazione": {
    title: "Interpolación",
    summary: "Cómo Premiere calcula los valores entre keyframes.",
    steps: [
      { kind: "theory", title: "Lineal vs Bézier", body: [
        "La **interpolación** es el cálculo que Premiere hace entre un keyframe y el siguiente. **Lineal** = velocidad constante (mecánica). **Bézier** = velocidad que cambia (más natural).",
        "Clic derecho en un keyframe → **Bézier temporal** (o *Ease In/Ease Out*) hace que el movimiento **desacelere** al llegar y/o **acelere** al salir.",
      ] },
      { kind: "quiz", question: "¿Cuál es la diferencia entre interpolación lineal y Bézier?", options: ["Lineal es a velocidad constante, Bézier varía la velocidad", "No hay diferencia", "Lineal es más rápido", "Bézier solo funciona con audio"], explanation: "Bézier = natural; lineal = mecánico." },
      { kind: "studio", title: "Suaviza el movimiento", instructions: "Toma la animación de posición que creaste antes y pon **Easy Ease** (F9) en los keyframes. Compara el resultado con y sin.", goals: ["**Easy Ease** aplicado", "Movimiento más suave"] },
    ],
  },
  "easing": {
    title: "Easing en la práctica",
    summary: "Acelerar, desacelerar y rebotar.",
    steps: [
      { kind: "theory", title: "Ease In, Ease Out", body: [
        "**Ease Out** al primer keyframe: el movimiento **sale** rápido y **desacelera**. **Ease In** al último keyframe: el movimiento **acelera** y **llega** suave. Ambos juntos = suave en los dos extremos.",
      ] },
      { kind: "quiz", question: "Quieres que un título entre volando y se detenga suavemente. ¿Qué easing usas?", options: ["Ease In en el último keyframe", "Ease Out en el último keyframe", "Sin easing", "Ease In en el primero"], explanation: "Ease In = desacelera en la llegada: perfecto para la parada suave." },
      { kind: "theory", title: "El editor de curvas", body: [
        "Para control total, abre el **Editor de gráficos de velocidad** (icono de gráfico en la línea de tiempo). Cuanto más **alta** la curva, más rápido se mueve; cuanto más **baja**, más lento.",
      ] },
      { kind: "quiz", question: "En el gráfico de velocidad, un pico alto significa…", options: ["Velocidad máxima", "Posición alta", "Clip grande", "Audio fuerte"], explanation: "La curva muestra velocidad: alto = rápido." },
      { kind: "studio", title: "Curva personalizada", instructions: "Abre el **Editor de gráficos** en la línea de tiempo y ajusta las manijas de Bézier para crear un movimiento que **desacelere** hacia el final.", goals: ["Curva de velocidad editada", "Desaceleración visible"] },
    ],
  },
  "codec": {
    title: "Códecs y contenedores",
    summary: "Por qué un MP4 no es lo mismo que un H.264.",
    steps: [
      { kind: "theory", title: "Códec ≠ contenedor", body: [
        "Un **códec** (H.264, H.265, ProRes, DNxHR) es el algoritmo que **comprime** el vídeo. Un **contenedor** (.mp4, .mov, .mkv) es la \"caja\" que contiene el vídeo comprimido + audio + subtítulos.",
        "Un mismo códec puede ir dentro de contenedores diferentes: H.264 dentro de .mp4 **y** de .mov.",
      ], terms: [{ term: "H.264", def: "Códec muy compatible, perfecto para la web" }, { term: "ProRes", def: "Códec de alta calidad para edición (archivos grandes)" }] },
      { kind: "quiz", question: "¿Cuál es la diferencia entre códec y contenedor?", options: ["El códec comprime, el contenedor empaqueta", "Son lo mismo", "El contenedor comprime, el códec empaqueta", "Ninguno comprime"], explanation: "Códec = algoritmo; contenedor = sobre que lo contiene." },
      { kind: "match", title: "Empareja", pairs: [["H.264", "Códec para la web"], ["ProRes", "Códec para edición"], [".mp4", "Contenedor"], [".mov", "Contenedor Apple"]] },
    ],
  },
  "bitrate": {
    title: "Bitrate",
    summary: "Cuántos datos por segundo y por qué importa.",
    steps: [
      { kind: "theory", title: "Más datos = más calidad", body: [
        "El **bitrate** es la cantidad de datos por segundo (Mbps). Más bitrate = más calidad y más peso. YouTube 1080p recomienda entre **8** y **12 Mbps**, 4K entre **35** y **45 Mbps**.",
        "CBR (constante) mantiene el mismo bitrate; VBR (variable) usa más datos en escenas complejas y menos en las simples: mejor relación calidad/peso.",
      ] },
      { kind: "quiz", question: "¿Qué ocurre si exportas un vídeo 1080p a 1 Mbps?", options: ["Calidad perfecta", "Vídeo borroso y con artefactos", "No se exporta", "El audio desaparece"], explanation: "1 Mbps para 1080p son pocos datos: calidad horrible." },
      { kind: "theory", title: "VBR 2 pasadas", body: [
        "**VBR 2 pasadas** es la mejor calidad: Premiere analiza todo el vídeo una primera vez, luego exporta distribuyendo los datos de forma óptima. Tarda el doble pero el resultado es el mejor posible.",
      ] },
      { kind: "quiz", question: "¿Cuál es la ventaja de VBR 2 pasadas?", options: ["Mejor distribución de datos = mejor calidad", "Es más rápido", "No hay diferencia", "Genera archivos más pequeños siempre"], explanation: "Dos pasadas = distribución inteligente de los datos." },
      { kind: "studio", title: "Exporta en VBR", instructions: "Exporta la secuencia en **H.264** con **VBR 2 pasadas**, bitrate objetivo entre **8** y **12 Mbps**.", goals: ["**H.264**", "**VBR 2 pasadas**", "Bitrate **8–12 Mbps**"] },
    ],
  },
  "export-youtube": {
    title: "Exportar para YouTube",
    summary: "El ajuste que funciona siempre.",
    steps: [
      { kind: "theory", title: "El formato de YouTube", body: [
        "YouTube acepta casi todo, pero recomienda: **H.264**, contenedor **.mp4**, resolución original de la secuencia (1080p o 4K), **VBR** con bitrate alto.",
        "Después de subir, YouTube **recomprime** con sus propios ajustes. Si tú subes calidad alta, la recompresión hace menos daño.",
      ] },
      { kind: "quiz", question: "¿Por qué conviene subir a YouTube con bitrate alto?", options: ["Porque YouTube recomprime y partimos de mejor calidad", "Porque YouTube no comprime", "No importa", "Por copyright"], explanation: "Subir buena calidad = menos pérdida tras la recompresión." },
      { kind: "studio", title: "Exporta para YouTube", instructions: "Exporta en **H.264** (.mp4), resolución **1920×1080**, bitrate entre **10** y **20 Mbps**, con audio **AAC a 320 kbps**.", goals: ["**H.264** (.mp4)", "**1920×1080**", "Bitrate **10–20 Mbps**", "Audio **AAC 320 kbps**"] },
    ],
  },
  "export-social": {
    title: "Exportar para redes sociales",
    summary: "Formatos correctos para Instagram, TikTok y otros.",
    steps: [
      { kind: "theory", title: "Cada red, su formato", body: [
        "**Instagram Reels / TikTok**: 1080×1920 (9:16), máx. 60–90 s. **Instagram feed**: 1080×1080 (1:1) o 1080×1350 (4:5). **Stories**: 1080×1920.",
        "Regla general: **H.264**, bitrate medio-alto (**6–15 Mbps**), tamaño bajo el límite de la plataforma.",
      ] },
      { kind: "quiz", question: "¿Cuál es la resolución de un Reel/TikTok?", options: ["1920×1080", "1080×1920", "1080×1080", "720×480"], explanation: "Vertical: 1080 de ancho × 1920 de alto." },
      { kind: "studio", title: "Exporta un Reel", instructions: "Crea o usa una secuencia **1080×1920** y exporta en **H.264** con bitrate entre **6** y **15 Mbps**.", goals: ["Secuencia **1080×1920**", "**H.264**", "Bitrate **6–15 Mbps**"] },
    ],
  },
  "master": {
    title: "La copia Master",
    summary: "Guardar la versión de máxima calidad.",
    steps: [
      { kind: "theory", title: "El master de tu trabajo", body: [
        "El **master** es la exportación de **máxima calidad** del proyecto: sin compresión agresiva, desde el cual puedes generar después todas las versiones (YouTube, Instagram, cliente…).",
        "Formato típico: **ProRes 422** o **DNxHR HQ** en .mov. Los archivos son **grandes** (varios GB), pero no pierden calidad.",
      ] },
      { kind: "quiz", question: "¿Para qué guardar un master?", options: ["Como fuente para generar todas las versiones futuras", "Para ahorrar espacio", "Para subirlo a Instagram directamente", "No tiene sentido"], explanation: "El master es la versión original de máxima calidad: se comprime solo cuando se necesita." },
      { kind: "studio", title: "Exporta el master", instructions: "Exporta la secuencia en **ProRes 422** (o DNxHR HQ) dentro de un contenedor **.mov**.", goals: ["Códec **ProRes 422** (o DNxHR)", "Contenedor **.mov**"] },
    ],
  },
  "inquadrature": {
    title: "Tipos de encuadre",
    summary: "Plano general, plano medio y primer plano.",
    steps: [
      { kind: "theory", title: "Plano amplio y plano detalle", body: [
        "Un **plano general** (wide shot) muestra toda la escena: sitúa al espectador. Un **plano detalle** (close-up) muestra una parte: un ojo, una mano, un objeto. Se usa para revelar emociones o detalles importantes.",
        "El **plano medio** (medium shot) encuadra al sujeto de la cintura para arriba: es el encuadre de la conversación, equilibrado entre contexto y detalle.",
      ] },
      { kind: "quiz", question: "¿Qué encuadre muestra las emociones del rostro?", options: ["Plano general", "Primer plano (close-up)", "Plano cenital", "Plano americano"], explanation: "El close-up lleva al espectador a los ojos del sujeto." },
      { kind: "match", title: "Empareja", pairs: [["Plano general", "Toda la escena"], ["Plano medio", "De la cintura para arriba"], ["Primer plano", "Solo el rostro"], ["Plano detalle", "Un ojo, una mano"]] },
    ],
  },
  "regola-180": {
    title: "La regla de los 180°",
    summary: "No confundir al espectador con direcciones invertidas.",
    steps: [
      { kind: "theory", title: "La línea imaginaria", body: [
        "Imagina una línea entre dos personas que hablan. Si la cámara se queda siempre del **mismo lado** de esa línea, el personaje A siempre mira hacia la derecha y el B hacia la izquierda: el espectador no se pierde.",
        "Si **cruzas** la línea, A y B parecen mirar en la misma dirección: confusión. Se puede cruzar, pero con un plano intermedio (cenital o frontal) que \"reoriente\" al espectador.",
      ] },
      { kind: "quiz", question: "¿Qué ocurre si cruzas la línea de los 180°?", options: ["Nada", "Los personajes parecen mirar en la misma dirección: confusión", "El audio se invierte", "Los colores cambian"], explanation: "Cruzar sin preparación desorienta al espectador." },
      { kind: "studio", title: "Respeta la línea", instructions: "Ordena los dos clips de entrevista para que los sujetos se miren entre sí (uno mira a la **izquierda**, el otro a la **derecha**).", goals: ["Los sujetos se miran", "No se cruza la línea de 180°"] },
    ],
  },
  "continuita": {
    title: "Montaje de continuidad",
    summary: "Un plano sigue al otro sin saltos lógicos.",
    steps: [
      { kind: "theory", title: "Acción continua", body: [
        "El **montaje de continuidad** crea la ilusión de que todo ocurre de forma fluida: un personaje abre una puerta en primer plano → en el siguiente plano la puerta se abre desde dentro. Si los gestos no coinciden, hay un *error de raccord*.",
        "Atención al **raccord de mirada** (los ojos miran en la dirección correcta), al de **posición** (los objetos están donde los dejamos) y al de **gesto** (el movimiento continúa).",
      ] },
      { kind: "quiz", question: "¿Qué es un error de raccord?", options: ["Una interrupción visual de la continuidad entre dos planos", "Un tipo de transición", "Un efecto de audio", "Un codec"], explanation: "El espectador nota que algo no cuadra, aunque no sepa decir qué." },
      { kind: "studio", title: "Continuidad perfecta", instructions: "Ordena los clips de forma que un **movimiento** (ej. mano que entra) continúe limpiamente de un clip al siguiente. Usa **Ripple/Roll** para ajustar el punto de corte.", goals: ["Acción continua entre los clips", "Sin saltos de raccord evidentes"] },
    ],
  },
  "alternato": {
    title: "Montaje alterno",
    summary: "Dos acciones en paralelo.",
    steps: [
      { kind: "theory", title: "Mientras tanto…", body: [
        "El **montaje alterno** muestra dos (o más) acciones que ocurren **al mismo tiempo** en lugares diferentes, alternándolas: A → B → A → B. Crea tensión y conexión entre las historias.",
        "Es el lenguaje de las escenas de persecución, las llamadas telefónicas, las conversaciones.",
      ] },
      { kind: "quiz", question: "¿Qué tipo de montaje alterna dos acciones simultáneas?", options: ["Montaje alterno", "Montaje de continuidad", "Jump cut", "Match cut"], explanation: "Alterno = dos hilos narrativos que avanzan juntos." },
      { kind: "studio", title: "Conversación a dos", instructions: "Alterna entre las tomas de **dos sujetos** (al menos 3 cambios A-B), como si estuvieran dialogando.", goals: ["Al menos **3 cambios** A-B", "Sensación de conversación"] },
    ],
  },
  "ritmo": {
    title: "Ritmo de montaje",
    summary: "Rápido, lento y cómo seguir la música.",
    steps: [
      { kind: "theory", title: "El ritmo cuenta la historia", body: [
        "Cortes **rápidos** (clips de 0,5–1 s) crean energía, tensión, velocidad. Cortes **lentos** (clips de 3–5 s o más) crean calma, reflexión, contemplación.",
        "Variar el ritmo **dentro** de un vídeo es fundamental: todo rápido cansa, todo lento aburre. La música dicta el ritmo: corta en los **beats** y todo cuadra.",
      ] },
      { kind: "quiz", question: "¿Por qué variar el ritmo de montaje?", options: ["Porque todo rápido cansa y todo lento aburre", "Por razones técnicas", "No es importante", "Para mejorar la calidad del audio"], explanation: "El ritmo es tensión y liberación: como la música." },
      { kind: "studio", title: "Rápido vs lento", instructions: "Crea una secuencia con al menos **3 clips rápidos** (≤ 1 s) y luego **1 clip largo** (≥ 3 s). Siente la diferencia de ritmo.", goals: ["Al menos **3 clips** ≤ 1 s", "Al menos **1 clip** ≥ 3 s", "Sin huecos"] },
    ],
  },
  "b-roll": {
    title: "B-roll",
    summary: "Las imágenes que hacen el vídeo profesional.",
    steps: [
      { kind: "theory", title: "¿Qué es el B-roll?", body: [
        "El **A-roll** es la acción principal (la entrevista, la explicación). El **B-roll** son las imágenes de apoyo que **muestran** lo que la voz está diciendo: si hablas de un café, muestras manos preparando el café.",
        "Sin B-roll, un vídeo es una cabeza parlante estática. Con B-roll, el vídeo cobra vida y esconde los cortes.",
      ] },
      { kind: "quiz", question: "¿Cuál es la función principal del B-roll?", options: ["Sustituir el audio", "Mostrar visualmente lo que se está diciendo", "Acortar el vídeo", "Aumentar la resolución"], explanation: "Mostrar, no solo contar: la primera regla del vídeo." },
      { kind: "studio", title: "Cubre la entrevista", instructions: "Pon al menos **2 clips de B-roll** en **V2** sobre la entrevista en V1, cada uno durando entre **2** y **5 segundos**.", goals: ["Al menos **2 clips** en V2", "Cada uno **2-5 s**", "Cubren la entrevista"] },
    ],
  },
  "sync-audio": {
    title: "Sincronizar audio",
    summary: "Alinear el audio externo con el de la cámara.",
    steps: [
      { kind: "theory", title: "Audio externo", body: [
        "A menudo se graba el audio con un **grabador externo** o un micrófono conectado a otro dispositivo. El resultado son dos archivos: el vídeo (con audio de cámara, de baja calidad) y el audio externo (bueno).",
        "La sincronización se puede hacer **manualmente** (alineando la forma de onda o la claqueta) o con **Sincronizar** (clic derecho → Fusionar clips) que compara las ondas.",
      ] },
      { kind: "quiz", question: "¿Por qué se usa un grabador externo?", options: ["Porque el micrófono de la cámara suena mal", "Porque no tiene micrófono", "Para el vídeo", "No es necesario"], explanation: "Un micrófono dedicado captura un audio muchísimo mejor que el de cámara." },
      { kind: "studio", title: "Sincroniza audio y vídeo", instructions: "Alinea el clip de **audio externo** con el **vídeo**: usa la forma de onda como guía para que coincidan, luego silencia la pista de audio de la cámara.", goals: ["Audio externo alineado con el vídeo", "Audio de cámara **silenciado**"] },
    ],
  },
  "multicam": {
    title: "Montaje multicámara",
    summary: "Cambiar entre dos o más cámaras en tiempo real.",
    steps: [
      { kind: "theory", title: "Secuencia multicámara", body: [
        "Si tienes el mismo evento grabado con **dos o más cámaras**, puedes crear una **Secuencia multicámara**: Premiere sincroniza los clips (por audio o timecode) y te permite **cambiar entre cámaras** en tiempo real durante la reproducción.",
        "Selecciona los clips, clic derecho → **Crear secuencia multicámara fuente**. Luego edita en el monitor multicámara: haz clic en la cámara que quieras mientras reproduces.",
      ] },
      { kind: "quiz", question: "¿Cómo se sincronizan las cámaras normalmente?", options: ["Por la forma de onda del audio", "Por el nombre del archivo", "No se pueden sincronizar", "Por el color del clip"], explanation: "El audio es la referencia más fiable para sincronizar." },
      { kind: "studio", title: "Edición multicámara", instructions: "Crea una secuencia multicámara con al menos **2 clips** y haz al menos **3 cambios de cámara** durante la reproducción.", goals: ["Secuencia **multicámara**", "Al menos **3 cambios** de cámara"] },
    ],
  },
  "tagliare-intervista": {
    title: "Cortar una entrevista",
    summary: "Eliminar lo superfluo y mantener lo esencial.",
    steps: [
      { kind: "theory", title: "El corte que no se nota", body: [
        "Al cortar una entrevista se eliminan pausas, repeticiones, errores. El secreto es cubrir los cortes con **B-roll**: así el espectador no nota los saltos en la imagen.",
        "Escucha el audio primero, marca lo que se queda, elimina lo demás. Luego cubre con B-roll.",
      ] },
      { kind: "quiz", question: "¿Cómo se esconden los cortes en una entrevista?", options: ["Con B-roll sobre los cortes", "No se puede", "Exportando a menor resolución", "Con más audio"], explanation: "B-roll cubre el salto visual: el audio fluye continuo." },
      { kind: "studio", title: "Corta y cubre", instructions: "Elimina al menos **2 pausas** de la entrevista y cubre los cortes con clips de **B-roll** en V2.", goals: ["Al menos **2 cortes** en la entrevista", "Cubiertos con **B-roll**"] },
    ],
  },
  "jump-cut": {
    title: "Jump cut",
    summary: "El corte que salta: cuándo usarlo y cuándo no.",
    steps: [
      { kind: "theory", title: "El salto intencional", body: [
        "Un **jump cut** es un corte dentro del mismo encuadre que crea un \"salto\" visible. En el cine clásico es un error; en YouTube y vlogs es un **estilo**: ritmo rápido, energía, eliminación de pausas.",
        "Funciona cuando el contexto lo permite (formato informal, energético). No funciona en narrativa, entrevistas formales o documentales.",
      ] },
      { kind: "quiz", question: "¿Cuándo es apropiado un jump cut?", options: ["En vlogs y contenido energético e informal", "En un documental serio", "En una entrevista formal", "Nunca"], explanation: "El contexto decide: formato informal = jump cut aceptado." },
      { kind: "studio", title: "Jump cuts rítmicos", instructions: "Corta un clip de entrevista en al menos **5 fragmentos** con jump cuts visibles, manteniendo solo las frases importantes.", goals: ["Al menos **5 cortes** jump-cut", "Solo quedan frases importantes"] },
    ],
  },
  "rallenty": {
    title: "Cámara lenta",
    summary: "Ralentizar la acción con estilo.",
    steps: [
      { kind: "theory", title: "Velocidad/Duración", body: [
        "Clic derecho en un clip → **Velocidad/Duración**: pon **50%** para la mitad de velocidad (slow motion), **200%** para el doble (fast motion).",
        "Para una cámara lenta de calidad, el metraje original debe estar grabado a **fps altos** (60, 120 o más): así hay suficientes fotogramas reales y no se ven saltos.",
      ] },
      { kind: "quiz", question: "¿Por qué se necesitan fps altos para una buena cámara lenta?", options: ["Para exportar más rápido", "Porque hay más fotogramas reales que mostrar al ralentizar", "No se necesitan", "Para mejor color"], explanation: "Ralentizar un clip de 24 fps crea imágenes duplicadas; a 120 fps hay de sobra." },
      { kind: "studio", title: "Cámara lenta al 50%", instructions: "Ralentiza un clip al **50%** (clic derecho → Velocidad/Duración) y revisa que se vea fluido.", goals: ["Velocidad al **50%**", "Reproducción fluida"] },
    ],
  },
  "time-remapping": {
    title: "Time remapping",
    summary: "Acelerar y ralentizar dentro del mismo clip.",
    steps: [
      { kind: "theory", title: "Velocidad variable", body: [
        "El **Time Remapping** (Reasignación de tiempo) permite cambiar la velocidad **dentro** del mismo clip: empieza normal, se ralentiza en la acción, vuelve a velocidad normal.",
        "En Premiere: clic derecho en el clip → Mostrar keyframes de clip → **Reasignación de tiempo → Velocidad**. Aparece una goma como la del volumen: sube = rápido, baja = lento.",
      ] },
      { kind: "quiz", question: "¿Cuál es la ventaja del Time Remapping sobre el simple cambio de velocidad?", options: ["Puedes cambiar la velocidad en diferentes momentos del mismo clip", "Es más rápido de aplicar", "No hay ventaja", "Solo funciona con audio"], explanation: "Velocidad variable en un clip = efecto dramático." },
      { kind: "studio", title: "Velocidad variable", instructions: "Aplica **Reasignación de tiempo** a un clip y crea al menos **3 keyframes** de velocidad: normal → lento → normal.", goals: ["**Reasignación de tiempo** activa", "Al menos **3 keyframes**", "Variación de velocidad visible"] },
    ],
  },
  "fps": {
    title: "Frame rate",
    summary: "24, 25, 30, 60: cuándo usar cada uno.",
    steps: [
      { kind: "theory", title: "Cuántos fotogramas por segundo", body: [
        "El **frame rate** (fps) es cuántas fotos por segundo componen el vídeo: **24 fps** = aspecto cinematográfico, **25 fps** = estándar europeo (PAL), **30 fps** = estándar americano y web, **60 fps** = fluido, ideal para deporte y cámara lenta.",
        "Elige los fps **antes** de grabar: la secuencia debería coincidir con el metraje. Mezclar fps diferentes requiere cuidado.",
      ] },
      { kind: "quiz", question: "¿Qué frame rate da un aspecto más cinematográfico?", options: ["60 fps", "24 fps", "120 fps", "1 fps"], explanation: "24 fps = el look de las películas: ligero desenfoque de movimiento que el ojo asocia con cine." },
      { kind: "match", title: "Empareja", pairs: [["24 fps", "Cine"], ["25 fps", "Europa (PAL)"], ["30 fps", "Web y TV americana"], ["60 fps", "Deporte y slow-motion"]] },
    ],
  },
  "fermo-immagine": {
    title: "Fotograma congelado",
    summary: "Pausar la imagen mientras el audio continúa.",
    steps: [
      { kind: "theory", title: "Congelar un instante", body: [
        "Un **fotograma congelado** (freeze frame) detiene la imagen en un fotograma mientras el audio (y el montaje) continúan. Útil para dar énfasis, para un final dramático o para presentar un personaje.",
        "En Premiere: posiciona el cabezal en el fotograma deseado, clic derecho → **Añadir fotograma congelado**. Luego ajusta su duración.",
      ] },
      { kind: "quiz", question: "¿Cuándo es útil un fotograma congelado?", options: ["Para dar énfasis a un momento o como final dramático", "Para mejorar el audio", "Para cambiar la resolución", "Nunca"], explanation: "La pausa en la imagen crea un \"¡mira aquí!\" visual." },
      { kind: "studio", title: "Congela el momento", instructions: "Crea un **fotograma congelado** en el momento más interesante del clip. Debe durar al menos **2 segundos**.", goals: ["Un **fotograma congelado**", "Duración al menos **2 s**"] },
    ],
  },
  "reverse": {
    title: "Invertir un clip",
    summary: "Reproducir al revés para efectos creativos.",
    steps: [
      { kind: "theory", title: "Play al revés", body: [
        "**Invertir** un clip (clic derecho → Velocidad/Duración → marcar **Invertir velocidad**) lo reproduce al revés. Los usos creativos son infinitos: objetos que se reconstruyen, líquidos que vuelven al vaso, personas que caminan al revés.",
        "Combinado con un corte bien colocado: la acción va al revés, corte, la acción va adelante. Efecto de \"rebote\".",
      ] },
      { kind: "quiz", question: "¿Cómo se invierte un clip en Premiere?", options: ["Clic derecho → Velocidad/Duración → Invertir velocidad", "Arrastrarlo al revés", "Con un efecto de audio", "No se puede"], explanation: "Marca la casilla y el clip se reproduce hacia atrás." },
      { kind: "studio", title: "Crea un rebote", instructions: "Duplica un clip (**Alt+arrastrar**), **invierte** la copia y ponla justo después del original. El resultado: la acción va y vuelve.", goals: ["Clip original + **copia invertida**", "Efecto de **rebote** visible"] },
    ],
  },
  "testi": {
    title: "Texto y títulos",
    summary: "Añadir textos legibles y con estilo.",
    steps: [
      { kind: "theory", title: "La herramienta Texto", body: [
        "**Ctrl+T** activa la herramienta Texto: haz clic en el Monitor de programa y escribe. Aparece un clip de título en la pista V superior.",
        "En el panel **Gráficos esenciales** puedes cambiar fuente, tamaño, color, contorno (stroke), sombra y alineación.",
      ] },
      { kind: "quiz", question: "¿Dónde se cambian las propiedades del texto (fuente, color, tamaño)?", options: ["En el panel Gráficos esenciales", "En los controles de efectos", "En el mezclador de audio", "En la barra de menú"], explanation: "Gráficos esenciales: un panel para todo lo visual de los títulos." },
      { kind: "theory", title: "Legibilidad", body: [
        "Texto sobre vídeo: usa siempre un **contorno** (stroke) o una **sombra** para separar las letras del fondo. Sin ellos, en fondos claros las letras desaparecen.",
      ] },
      { kind: "quiz", question: "¿Cómo haces el texto legible sobre cualquier fondo?", options: ["Añadir contorno o sombra", "Ponerlo más pequeño", "Cambiar la resolución", "No se puede"], explanation: "El contorno garantiza contraste con cualquier fondo." },
      { kind: "studio", title: "Título con estilo", instructions: "Crea un texto con la herramienta Texto (**Ctrl+T**), tamaño al menos **60**, con **contorno** o **sombra** activado.", goals: ["Texto creado", "Tamaño ≥ **60**", "**Contorno** o **sombra**"] },
    ],
  },
  "lower-third": {
    title: "Lower third",
    summary: "La franja inferior para nombres y cargos.",
    steps: [
      { kind: "theory", title: "¿Qué es un lower third?", body: [
        "Un **lower third** es un gráfico en la parte inferior de la pantalla que muestra **nombre** y **cargo** (o lugar, fecha, etc.). Es estándar en entrevistas, noticias y documentales.",
        "Normalmente tiene un **fondo** semitransparente o una barra de color, texto **en negrita** para el nombre y texto más pequeño para la descripción.",
      ] },
      { kind: "quiz", question: "¿Dónde se coloca un lower third?", options: ["En la parte superior", "En la parte inferior de la pantalla", "En el centro", "Fuera de pantalla"], explanation: "Lower = inferior: tercio inferior de la pantalla." },
      { kind: "studio", title: "Crea un lower third", instructions: "Crea un gráfico con **nombre** (fuente grande, negrita) y **cargo** (fuente pequeña) en la parte **inferior** de la pantalla (por debajo de 700 px en Y), con un **fondo** semitransparente.", goals: ["Nombre **grande**", "Cargo **pequeño**", "En la parte **inferior**", "Con **fondo**"] },
    ],
  },
  "safe-margin": {
    title: "Márgenes de seguridad",
    summary: "No salgas de los bordes de la pantalla.",
    steps: [
      { kind: "theory", title: "Márgenes de acción y título", body: [
        "Los márgenes de seguridad son guías que muestran las zonas donde el contenido siempre es visible: el **margen de título** (10% desde los bordes) asegura que el texto no se corte en los televisores.",
        "Actívalos desde el menú del Monitor de programa (icono de llave inglesa → Márgenes de seguridad).",
      ] },
      { kind: "quiz", question: "¿Por qué mantener los textos dentro del margen de título?", options: ["Para que no se corten en ninguna pantalla", "Para mejorar el audio", "No es importante", "Para exportar más rápido"], explanation: "Las pantallas recortan los bordes de formas diferentes: quédate dentro del margen." },
      { kind: "studio", title: "Textos seguros", instructions: "Activa los **Márgenes de seguridad** en el Monitor de programa y mueve el texto para que esté completamente **dentro** del margen de título.", goals: ["Márgenes de seguridad **visibles**", "Texto dentro del margen de **título**"] },
    ],
  },
  "sottotitoli": {
    title: "Subtítulos",
    summary: "Crear y corregir los subtítulos.",
    steps: [
      { kind: "theory", title: "¿Por qué subtitular?", body: [
        "En redes sociales el **85%** de los vídeos se ven **sin sonido**. Los subtítulos mantienen la atención y hacen el vídeo accesible para quienes no pueden oír.",
        "Premiere los genera a partir de la transcripción (**Texto → Transcribir**), pero siempre hay que **revisarlos y corregirlos**: los nombres y términos técnicos suelen salir mal.",
      ] },
      { kind: "quiz", question: "¿Por qué corregir los subtítulos generados automáticamente?", options: ["Nunca es necesario", "El reconocimiento suele errar en nombres y términos", "Para hacerlos más largos", "Para cambiar el idioma"], explanation: "La transcripción automática es un gran punto de partida, no el resultado final." },
      { kind: "theory", title: "Reglas de oro", body: [
        "Máximo **2 líneas**, unos **35–42 caracteres** por línea, cada una en pantalla al menos **1 segundo**. Blanco con contorno o fondo negro: legible sobre cualquier cosa.",
      ] },
      { kind: "quiz", question: "¿Cuántas líneas como máximo para un subtítulo?", options: ["1", "2", "4", "Las que hagan falta"], explanation: "Dos líneas: más no se pueden leer a tiempo." },
      { kind: "studio", title: "Subtitula la primera frase", instructions: "Añade un subtítulo con el texto **¡Hola a todos!** en la parte **inferior** de la pantalla (por debajo de 860 px), con **fondo** activado, que dure de **0** a unos **2–4 s**.", goals: ["Texto **¡Hola a todos!**", "En la parte inferior", "Con **fondo**", "Dura **2–4 s** desde el inicio"] },
    ],
  },
  "grafiche-essenziali": {
    title: "Gráficos esenciales",
    summary: "Usar y personalizar plantillas.",
    steps: [
      { kind: "theory", title: "Plantillas listas para usar", body: [
        "El panel **Gráficos esenciales** contiene **plantillas** de títulos, lower thirds y subtítulos. Arrástralas a la línea de tiempo y cambia texto, colores y fuente.",
        "También puedes crear tus **propias** plantillas y reutilizarlas en todos los proyectos: así cada vídeo de tu canal tiene el mismo estilo.",
      ] },
      { kind: "quiz", question: "¿Por qué crear plantillas propias de gráficos?", options: ["Para un estilo consistente en todos los vídeos", "Para exportar más rápido", "Para más pistas", "No es necesario"], explanation: "Consistencia = reconocimiento de marca." },
      { kind: "theory", title: "Capas múltiples en un gráfico", body: [
        "Un clip de gráfico puede contener **varias capas**: texto, rectángulos, elipses. Con el gráfico seleccionado, crea una nueva capa y se añade dentro del mismo clip.",
      ] },
      { kind: "quiz", question: "Quieres un rectángulo de color detrás del nombre. ¿Qué añades?", options: ["Una capa de forma (rectángulo) en el mismo gráfico", "Una nueva secuencia", "Un efecto de audio", "Una transición"], explanation: "Texto + forma en el mismo clip de gráfico." },
      { kind: "studio", title: "Personaliza una plantilla", instructions: "Usa la plantilla **Large Caption** (u otra) desde **Gráficos esenciales → Explorar**, cambia el texto a **CAPÍTULO 2** y añade un **rectángulo** al mismo gráfico.", goals: ["Texto **CAPÍTULO 2**", "Un **rectángulo** en el mismo gráfico"] },
    ],
  },

  // Sección 3
  "rec709": { title: "¿Qué es Rec.709?", summary: "El estándar de color de todo vídeo que ves.", steps: [
    { kind: "theory", title: "Un estándar para todos", body: ["**Rec.709** es el estándar para vídeo HD: define qué colores existen (el **espacio de color**), cómo se distribuye el brillo (la **gamma**) y dónde están el blanco y el negro.", "Casi todo lo que ves en YouTube, TV y móvil está (o acaba) en Rec.709. Es el \"idioma común\" entre tu línea de tiempo y la pantalla del espectador."], terms: [{ term: "Espacio de color", def: "El conjunto de colores reproducibles" }, { term: "Gamma", def: "Cómo los valores se convierten en brillo" }] },
    { kind: "quiz", question: "¿Por qué trabajar en Rec.709 para YouTube?", options: ["Porque pesa menos", "Porque es el estándar que las pantallas esperan", "Porque es en blanco y negro", "No se trabaja en Rec.709"], explanation: "Si la línea de tiempo habla Rec.709, lo que ves es lo que verá el espectador." },
    { kind: "theory", title: "Vídeo \"plano\"", body: ["Muchas cámaras graban de forma **plana** (bajo contraste y saturación) para conservar detalle. El primer paso del colorista es llevar esa imagen a un **Rec.709 normal**: negros negros, blancos blancos, colores creíbles."] },
    { kind: "quiz", question: "Una imagen gris y lavada recién importada necesita…", options: ["Más contraste y saturación", "Menos contraste", "Un efecto de audio", "Una transición"], explanation: "Llevarla a un aspecto normal antes de cualquier decisión creativa." },
    { kind: "studio", title: "De plano a normal", instructions: "El atardecer está **plano**. Con **Lumetri Color** llévalo a un aspecto normal: **Contraste** general al menos **+20** y **Saturación** general al menos **110**.", goals: ["Contraste general ≥ **+20**", "Saturación general ≥ **110**"] },
    { kind: "match", title: "Empareja", pairs: [["Rec.709", "Estándar de vídeo HD"], ["Espacio de color", "Qué colores existen"], ["Gamma", "Distribución del brillo"], ["Plano", "Bajo contraste y saturación"]] },
  ] },
  "gamma": { title: "Espacios de color y gamma", summary: "Por qué el mismo archivo se ve diferente en dos pantallas.", steps: [
    { kind: "theory", title: "Mismo archivo, distintas pantallas", body: ["Un móvil al máximo brillo, un monitor barato y un televisor muestran el mismo vídeo de forma diferente. Por eso los coloristas usan un monitor **calibrado**.", "La **Gamma** decide cómo los valores medios se convierten en luz: gamma más alta oscurece los medios, más baja los aclara."] },
    { kind: "quiz", question: "¿Por qué los coloristas usan monitores calibrados?", options: ["Para jugar mejor", "Para ver el color real, no lo que la pantalla inventa", "Porque cuestan menos", "No es necesario"], explanation: "Si la pantalla miente, toda corrección es errónea." },
    { kind: "theory", title: "Medios tonos con Levels", body: ["El efecto **Levels** tiene un control de **Gamma**: por encima de 1 aclara los medios **sin** tocar negros ni blancos. La forma más limpia de abrir una imagen ligeramente oscura."] },
    { kind: "quiz", question: "Quieres aclarar rostros en sombra sin quemar el cielo. ¿Qué ajustas?", options: ["Gamma (medios tonos)", "Punto de blanco", "Volumen", "Duración"], explanation: "Gamma actúa sobre los medios y deja los extremos intactos." },
    { kind: "studio", title: "Abre los medios tonos", instructions: "La entrevista está un poco oscura en los medios. Aplica el efecto **Levels** (Efectos de vídeo → Ajuste) y sube la **Gamma** entre **1.2** y **1.6**.", goals: ["Gamma de Levels entre **1.2** y **1.6**"] },
  ] },
  "log": { title: "Log vs Rec.709", summary: "Por qué el metraje Log se ve gris y cómo corregirlo.", steps: [
    { kind: "theory", title: "El perfil Log", body: ["Las cámaras modernas graban en **Log** (S-Log, V-Log, C-Log…): una curva que comprime altas luces y sombras para **conservar más rango dinámico**.", "El resultado se ve **gris y lavado**. No es un error: es un negativo digital que necesita ser **convertido** a Rec.709 (con un LUT técnico o manualmente)."] },
    { kind: "quiz", question: "¿Por qué el metraje Log se ve gris?", options: ["La cámara está rota", "La curva Log comprime luces y sombras para conservar detalle", "Falta el audio", "Es en blanco y negro"], explanation: "Es intencionado: más información que recuperar después." },
    { kind: "theory", title: "El orden correcto", body: ["Primero **convertir** el Log (LUT técnico o corrección), luego **corregir** (exposición, balance), luego hacer el **look** creativo. Invertir el orden complica todo."] },
    { kind: "quiz", question: "¿Cuál es el orden correcto?", options: ["Look → conversión → corrección", "Conversión → corrección → look", "Corrección → look → conversión", "No importa el orden"], explanation: "Primero llevar a Rec.709, luego corregir, luego crear el estilo." },
    { kind: "studio", title: "Convierte el Log manualmente", instructions: "El dron fue grabado en **Log**: gris y plano. Con Lumetri sube el **Contraste** general al menos a **0** y la **Saturación** general al menos a **95**.", goals: ["Contraste general ≥ **0**", "Saturación general ≥ **95**"] },
    { kind: "studio", title: "Luego el look", instructions: "Ahora que el dron está convertido, añade **después** del Lumetri un efecto **Apply Color LUT** con el look **Cinematic teal & orange**.", goals: ["LUT **Cinematic teal & orange**", "LUT va **después** de Lumetri"] },
  ] },
  "bit-depth": { title: "Profundidad de bits y compresión", summary: "8 bits, 10 bits y banding.", steps: [
    { kind: "theory", title: "Cuántos tonos", body: ["La **profundidad de bits** indica cuántos tonos tiene cada canal: **8 bits** = 256 niveles, **10 bits** = 1024. Con más niveles, las transiciones graduales (un cielo, una pared) se mantienen suaves.", "Con pocos bits y compresión fuerte aparece el **banding**: franjas visibles en vez de un degradado suave."] },
    { kind: "quiz", question: "¿Cuántos niveles por canal tiene un vídeo de 10 bits?", options: ["256", "1024", "16", "10"], explanation: "2 elevado a 10 = 1024 niveles, cuatro veces más que 8 bits." },
    { kind: "theory", title: "Combatir el banding", body: ["Lo mejor es prevenirlo (grabar en 10 bits, no forzar la corrección). Si ya está ahí, un toque de **grano** (*Add Grain*) rompe las franjas y las hace invisibles."] },
    { kind: "quiz", question: "Un cielo de atardecer muestra franjas de color. ¿Qué ayuda?", options: ["Añadir un poco de grano", "Subir la saturación al máximo", "Exportar a 1 Mbps", "Ralentizar el vídeo"], explanation: "El grano enmascara los saltos entre niveles." },
    { kind: "studio", title: "Oculta el banding", instructions: "El cielo del atardecer tiene banding. Añade **Add Grain** (Ruido y grano) con **Intensidad** al menos **1.5**.", goals: ["Grano con intensidad ≥ **1.5**"] },
    { kind: "match", title: "Empareja", pairs: [["8 bits", "256 niveles"], ["10 bits", "1024 niveles"], ["Banding", "Franjas en los degradados"], ["Grano", "Rompe las franjas"]] },
  ] },
  "hdr": { title: "HDR en pocas palabras", summary: "Qué cambia con PQ y HLG.", steps: [
    { kind: "theory", title: "Alto rango dinámico", body: ["**HDR** permite luces mucho más **brillantes** y más detalle en sombras que SDR (Rec.709). Se mide en **nits**: SDR llega a unos 100, HDR a 1000 y más.", "Dos estándares principales: **PQ** (HDR10, Dolby Vision: cine y streaming) y **HLG** (broadcast, compatible con TVs SDR)."] },
    { kind: "quiz", question: "¿Qué estándar HDR está diseñado para ser compatible con TVs normales?", options: ["PQ", "HLG", "Rec.709", "ProRes"], explanation: "HLG se ve aceptable incluso en pantallas SDR." },
    { kind: "theory", title: "Cuidado con las altas luces quemadas", body: ["En SDR, las luces por encima del 100% se **queman** (blanco plano sin detalle). Incluso en SDR, mantén los blancos por debajo del límite: el detalle perdido no se recupera."] },
    { kind: "quiz", question: "¿Qué significa \"altas luces quemadas\"?", options: ["Zonas blancas sin ningún detalle", "Colores demasiado saturados", "Audio distorsionado", "Un tipo de transición"], explanation: "El sensor (o la corrección) superó el máximo: solo queda blanco." },
    { kind: "studio", title: "Recupera las luces", instructions: "El atardecer está sobreexpuesto y el cielo quemado. Con Lumetri baja la **Exposición** general a **≤ 0.3** y las **Luces** a **≤ 0**.", goals: ["Exposición general ≤ **0.3**", "Luces ≤ **0**"] },
  ] },
  "waveform": { title: "La forma de onda", summary: "Leer luces y sombras con precisión.", steps: [
    { kind: "theory", title: "Medir la luz", body: ["La **forma de onda** muestra el brillo de la imagen de **0** (negro) a **100** (blanco), de izquierda a derecha según la imagen.", "Una imagen bien expuesta llena la mayor parte de la escala: negros cerca de 0–5, blancos cerca de 90–100, sin aplastar los extremos."] },
    { kind: "quiz", question: "En la forma de onda, el trazo está todo entre 0 y 30. La imagen está…", options: ["Sobreexpuesta", "Subexpuesta", "Perfecta", "En blanco y negro"], explanation: "Todo bajo = todo oscuro." },
    { kind: "theory", title: "Los ojos mienten, los scopes no", body: ["Después de un rato el ojo se **adapta** y una imagen oscura parece normal. Los **Scopes** (Lumetri Scopes en Premiere) dan números objetivos: confía en ellos."] },
    { kind: "quiz", question: "¿Por qué usar scopes en vez de \"a ojo\"?", options: ["Son más coloridos", "El ojo se adapta y puede equivocarse, los scopes miden", "Son obligatorios para exportar", "No es necesario"], explanation: "Medir en vez de suponer." },
    { kind: "studio", title: "Llévalo a escala", instructions: "Según la forma de onda, la ciudad está **subexpuesta** (todo abajo). Corrige la **Exposición** general entre **−0.4** y **+0.6**.", goals: ["Exposición general entre **−0.4** y **+0.6**"] },
    { kind: "match", title: "Empareja", pairs: [["0 IRE", "Negro"], ["100 IRE", "Blanco"], ["Trazo abajo", "Imagen oscura"], ["Scopes", "Mediciones objetivas"]] },
  ] },
  "vectorscope": { title: "El vectorscopio", summary: "Tono y saturación bajo control.", steps: [
    { kind: "theory", title: "Un círculo de colores", body: ["El **vectorscopio** es un círculo: la **dirección** muestra el **tono** (rojo, amarillo, verde, cian, azul, magenta), la **distancia del centro** muestra la **saturación**.", "Una imagen en blanco y negro es un punto en el centro. Una imagen sobresaturada llega hacia los bordes, más allá de las cajas de referencia."] },
    { kind: "quiz", question: "En el vectorscopio, ¿qué indica la distancia del centro?", options: ["Brillo", "Saturación", "Duración", "Volumen"], explanation: "Más lejos = más saturado." },
    { kind: "theory", title: "Saturación legal", body: ["Para TV, los colores no deben superar ciertos límites (las cajas del vectorscopio). En la web eres más libre, pero los colores sobresaturados se ven falsos y \"sangran\"."] },
    { kind: "quiz", question: "Una imagen perfectamente en blanco y negro en el vectorscopio es…", options: ["Un círculo completo", "Un punto en el centro", "Una línea hacia el rojo", "Invisible"], explanation: "Cero saturación: todo en el centro." },
    { kind: "studio", title: "¡Demasiado saturado!", instructions: "El café se ha sobresaturado y el vectorscopio sale de las cajas. Baja la **Saturación** general entre **90** y **120**.", goals: ["Saturación general **90–120**"] },
  ] },
  "parade": { title: "El parade RGB", summary: "Encontrar dominantes de color.", steps: [
    { kind: "theory", title: "Tres canales lado a lado", body: ["El **parade RGB** muestra tres formas de onda lado a lado: **rojo**, **verde** y **azul**. Sobre algo neutro (blanco, gris) los tres canales deberían estar a la **misma altura**.", "Si el azul está más alto que los demás, la imagen tiene una **dominante fría**; si el rojo está más alto, **cálida**."] },
    { kind: "quiz", question: "En el parade, el canal rojo está mucho más alto que verde y azul. La imagen está…", options: ["Demasiado fría", "Demasiado cálida", "Perfecta", "Subexpuesta"], explanation: "Exceso de rojo = dominante cálida." },
    { kind: "theory", title: "Corregir la dominante", body: ["En Lumetri: **Temperatura** desplaza entre azul y naranja, **Tinte** entre verde y magenta. Alinea los canales sobre áreas neutras."] },
    { kind: "quiz", question: "¿Qué control corrige una dominante verde (luces de neón)?", options: ["Temperatura", "Tinte", "Exposición", "Viñeta"], explanation: "Tinte trabaja en el eje verde–magenta." },
    { kind: "studio", title: "Quita la dominante cálida", instructions: "La ciudad es toda naranja: en el parade domina el rojo. Lleva la **Temperatura** general entre **−15** y **+15**.", goals: ["Temperatura general **−15…+15**"] },
    { kind: "match", title: "Empareja", pairs: [["Azul alto", "Dominante fría"], ["Rojo alto", "Dominante cálida"], ["Temperatura", "Eje azul–naranja"], ["Tinte", "Eje verde–magenta"]] },
  ] },
  "istogramma": { title: "El histograma", summary: "Distribución tonal de un vistazo.", steps: [
    { kind: "theory", title: "Una montaña de píxeles", body: ["El **histograma** cuenta cuántos píxeles hay en cada nivel de brillo: sombras a la izquierda, luces a la derecha.", "Una montaña **aplastada contra el borde izquierdo** significa **negros aplastados** (detalle perdido); contra el derecho, **luces quemadas**."] },
    { kind: "quiz", question: "El histograma está aplastado contra el borde izquierdo. ¿Qué ocurre?", options: ["Las sombras están aplastadas y se pierde detalle", "Las luces están quemadas", "Todo está bien", "Hay demasiado audio"], explanation: "Los píxeles se apilan en el negro absoluto." },
    { kind: "theory", title: "Abrir las sombras", body: ["El control de **Sombras** de Lumetri levanta las zonas oscuras sin tocar el resto: recupera detalle en el pelo, ropa oscura, esquinas."] },
    { kind: "quiz", question: "¿Qué control recupera detalle en las zonas oscuras?", options: ["Luces", "Sombras", "Saturación", "Tinte"], explanation: "Sombras actúa justo ahí." },
    { kind: "studio", title: "Recupera las sombras", instructions: "Las sombras de la entrevista están aplastadas. Lleva las **Sombras** generales al menos a **−10** (empiezan en −80) sin subir la exposición por encima de **+0.5**.", goals: ["Sombras ≥ **−10**", "Exposición ≤ **+0.5**"] },
  ] },
  "skin-line": { title: "La línea de tono de piel", summary: "Piel natural con el vectorscopio.", steps: [
    { kind: "theory", title: "Toda piel en una línea", body: ["En el vectorscopio hay una línea diagonal entre rojo y amarillo: la **línea de tono de piel**. La piel humana, **de cualquier color**, cae cerca de ella: la saturación cambia, no el tono.", "Si el rostro se desvía hacia **magenta** o **verde**, la persona parece enferma o artificial."] },
    { kind: "quiz", question: "En el vectorscopio, la piel de personas con diferentes tonos…", options: ["Está en lados opuestos", "Cae cerca de la misma línea, solo cambia la distancia al centro", "Es invisible", "Siempre está en el centro"], explanation: "Mismo tono, diferente saturación." },
    { kind: "theory", title: "Aislar el rostro", body: ["Para comprobar solo la piel, los coloristas amplían el rostro o usan una máscara, para que el vectorscopio muestre solo esos píxeles."] },
    { kind: "quiz", question: "El rostro se desvía hacia el verde. ¿Qué corriges?", options: ["Tinte hacia magenta", "Temperatura hacia azul", "Volumen", "Saturación a cero"], explanation: "El verde se compensa con magenta en el eje del Tinte." },
    { kind: "studio", title: "Piel natural", instructions: "La piel del entrevistado está **magenta**: el Tinte está a +50. Lleva el **Tinte** general entre **−10** y **+10** y mantén la **Temperatura** dentro de ±20.", goals: ["Tinte **−10…+10**", "Temperatura dentro de **±20**"] },
  ] },
  "esposizione": { title: "Exposición", summary: "Llevar luces y sombras al rango correcto.", steps: [
    { kind: "theory", title: "El primer control", body: ["La **Exposición** en Lumetri sube o baja toda la imagen en **pasos** (como en la cámara): +1 duplica la luz, −1 la divide a la mitad.", "Es el primer paso de toda corrección: luz primero, el resto después."] },
    { kind: "quiz", question: "Exposición +1 en Lumetri significa…", options: ["Un poco más brillante", "El doble de luz (un paso)", "Más saturación", "Más contraste"], explanation: "Un paso = doble de luz." },
    { kind: "theory", title: "Luces y sombras por separado", body: ["Después de la exposición afinas **Luces** (zonas brillantes) y **Sombras** (zonas oscuras) para recuperar detalle sin afectar al resto."] },
    { kind: "quiz", question: "El cielo está quemado pero el sujeto se ve bien. ¿Qué bajas?", options: ["Luces", "Sombras", "Tinte", "Intensidad"], explanation: "Luces actúa solo sobre las zonas brillantes." },
    { kind: "studio", title: "Demasiado oscuro", instructions: "El dron está subexpuesto dos pasos. Lleva la **Exposición** general entre **−0.3** y **+0.5**.", goals: ["Exposición **−0.3…+0.5**"] },
    { kind: "studio", title: "Demasiado brillante", instructions: "Ahora lo contrario: la ciudad está **sobreexpuesta**. Exposición entre **−0.3** y **+0.3** y **Luces** a **≤ 0**.", goals: ["Exposición **−0.3…+0.3**", "Luces ≤ **0**"] },
  ] },
  "contrasto": { title: "Contraste", summary: "Añadir profundidad sin quemar detalle.", steps: [
    { kind: "theory", title: "Profundidad", body: ["El **Contraste** es la distancia entre zonas oscuras y brillantes. Poco contraste = imagen plana; demasiado = sombras aplastadas y luces quemadas.", "Un buen contraste separa al sujeto del fondo y añade **dimensión**."] },
    { kind: "quiz", question: "Demasiado contraste puede…", options: ["Aplastar sombras y quemar luces", "Bajar el volumen", "Ralentizar el vídeo", "Cambiar el formato"], explanation: "Los extremos se aplastan y se pierde detalle." },
    { kind: "theory", title: "Contraste con control", body: ["Sube el **Contraste** y luego recupera con **Luces** (abajo) y **Sombras** (arriba) si se pierden los extremos. Misma idea que una **curva en S**."] },
    { kind: "quiz", question: "Después de subir el contraste el cielo se quema. ¿Qué haces?", options: ["Bajar Luces", "Subir saturación", "Subir Luces", "Nada"], explanation: "Luces recuperan las zonas brillantes." },
    { kind: "studio", title: "Añade profundidad", instructions: "El atardecer está plano. Lleva el **Contraste** general al menos a **+25**, pero mantén las **Luces** a **≤ +10** para no quemar el cielo.", goals: ["Contraste ≥ **+25**", "Luces ≤ **+10**"] },
  ] },
  "bilanciamento-bianco": { title: "Balance de blancos", summary: "Quitar dominantes cálidas o frías.", steps: [
    { kind: "theory", title: "El blanco debe ser blanco", body: ["Cada luz tiene una **temperatura de color**: una bombilla casera es cálida (naranja, ~3200 K), un cielo nublado es frío (azul, ~6500 K o más).", "Si la cámara no estaba bien configurada, la imagen tiene una **dominante**. El balance de blancos la elimina: lo que era blanco vuelve a ser blanco."], terms: [{ term: "Kelvin (K)", def: "Unidad de temperatura de color" }, { term: "Cuentagotas", def: "Haz clic en un área blanca y Lumetri balancea automáticamente" }] },
    { kind: "quiz", question: "Un plano interior con bombillas incandescentes tiende a verse…", options: ["Azul", "Naranja", "Verde", "Púrpura"], explanation: "La luz de tungsteno es cálida." },
    { kind: "theory", title: "El cuentagotas", body: ["En Lumetri hay el **cuentagotas de balance de blancos**: haz clic en algo que debería ser blanco o gris y Temperatura y Tinte se ajustan automáticamente."] },
    { kind: "quiz", question: "¿En qué haces clic con el cuentagotas de balance de blancos?", options: ["Un rostro", "Algo que debería ser blanco o gris neutro", "Un cielo azul", "Un objeto rojo"], explanation: "Necesitas una referencia neutra." },
    { kind: "studio", title: "Calienta una imagen fría", instructions: "El mar está demasiado **azul** (Temperatura −60). Lleva la **Temperatura** general entre **−10** y **+10**.", goals: ["Temperatura **−10…+10**"] },
  ] },
  "saturazione": { title: "Saturación e intensidad", summary: "Colores vivos pero creíbles.", steps: [
    { kind: "theory", title: "Dos controles diferentes", body: ["La **Saturación** sube **todos** los colores por igual. La **Intensidad** (Vibrance) sube principalmente los colores **poco saturados** y protege los ya fuertes y la piel.", "Por eso los coloristas casi siempre prefieren **Intensidad**: colores más ricos sin caras naranjas."] },
    { kind: "quiz", question: "Quieres colores más vivos sin poner las caras naranjas. ¿Qué usas?", options: ["Saturación al máximo", "Intensidad (Vibrance)", "Exposición", "Tinte"], explanation: "Intensidad protege la piel y los colores ya saturados." },
    { kind: "theory", title: "Menos es más", body: ["Una imagen sobresaturada cansa y se ve falsa. A menudo **+10/+20** de intensidad es suficiente."] },
    { kind: "quiz", question: "¿Cuál es un valor razonable de intensidad para un aspecto natural?", options: ["+15", "+100", "−100", "+500"], explanation: "Pequeños ajustes, gran diferencia." },
    { kind: "studio", title: "Colores vivos, caras naturales", instructions: "Haz el café más apetecible con **Intensidad** (al menos **+20**) pero mantén la **Saturación** general a **≤ 120**.", goals: ["Intensidad ≥ **+20**", "Saturación ≤ **120**"] },
  ] },
  "match-clip": { title: "Igualar dos clips", summary: "Hacer que dos cámaras parezcan una.", steps: [
    { kind: "theory", title: "Una escena, un color", body: ["Dos cámaras diferentes (o la misma con diferente luz) dan colores diferentes. Si alternas sin corregir, el espectador **nota** el salto.", "Eliges un clip de **referencia** (el *hero shot*) y acercas los demás a él, observando los scopes lado a lado."] },
    { kind: "quiz", question: "¿Qué es el clip de referencia al igualar color?", options: ["El más corto", "Al que alineas todos los demás", "El último en la línea de tiempo", "Un clip negro"], explanation: "Todos los demás se acercan a él." },
    { kind: "theory", title: "Comparación lado a lado", body: ["Lumetri tiene una **Vista de comparación**: referencia a la izquierda, clip a corregir a la derecha. Fíjate especialmente en la **piel**, los **blancos** y los **negros**."] },
    { kind: "quiz", question: "¿Qué compruebas primero para igualar dos planos de entrevista?", options: ["Piel y neutros", "Duración", "Volumen", "Nombres de archivo"], explanation: "La piel y los neutros delatan inmediatamente las diferencias." },
    { kind: "studio", title: "Iguala los dos planos", instructions: "El primer clip (referencia) es cálido, el segundo es neutro. Lleva el **segundo** clip a la misma temperatura del primero (diferencia ≤ **10**).", goals: ["Temperaturas igualadas (≤ 10 de diferencia)"] },
  ] },
  "lut": { title: "Looks y LUTs", summary: "Aplicar un LUT en el punto correcto de la cadena.", steps: [
    { kind: "theory", title: "¿Qué es un LUT?", body: ["Un **LUT** (Look-Up Table) es una tabla que transforma cada color en otro. Hay LUTs **técnicos** (Log a Rec.709) y LUTs **creativos** (un look: teal & orange, film…).", "Un LUT creativo debe aplicarse **después** de la corrección: si la imagen de partida está mal, el look quedará mal."] },
    { kind: "quiz", question: "¿Dónde va un LUT creativo en la cadena de efectos?", options: ["Antes de todo", "Después de la corrección primaria", "En vez del audio", "No importa"], explanation: "Primero corrige la imagen, luego el look." },
    { kind: "theory", title: "Dosificar el look", body: ["Un LUT al 100% suele ser demasiado fuerte. En Lumetri puedes bajar su **intensidad**, o ponerlo en una **capa de ajuste** con opacidad reducida."] },
    { kind: "quiz", question: "El LUT es demasiado fuerte. ¿Cómo lo suavizas?", options: ["Bajar la intensidad o la opacidad de la capa de ajuste", "Exportar a 720p", "Subir el volumen", "No se puede"], explanation: "Dosifícalo como un ingrediente." },
    { kind: "studio", title: "Corrección, luego look", instructions: "El atardecer ya tiene una corrección Lumetri. Añade **después** un efecto **Apply Color LUT** con el look **Warm Film**.", goals: ["LUT **Warm Film**", "Después de Lumetri"] },
    { kind: "studio", title: "Un look para toda la secuencia", instructions: "Aplica el look a **todos** los clips a la vez: crea una **Capa de ajuste** (Archivo → Nuevo), ponla en **V2** sobre los clips y aplica el LUT **Cinematic teal & orange**.", goals: ["Capa de ajuste en V2", "…con el LUT teal & orange", "Cubre ambos clips"] },
  ] },
  "curve": { title: "Curvas", summary: "La herramienta más potente del colorista.", steps: [
    { kind: "theory", title: "La curva tonal", body: ["La **curva** pone entrada (horizontal) y salida (vertical) en un gráfico. Una línea recta no cambia nada; mover puntos ajusta sombras, medios tonos y luces con precisión.", "La clásica **curva en S** baja ligeramente las sombras y sube ligeramente las luces: más contraste, pero suave."] },
    { kind: "quiz", question: "¿Qué efecto tiene una curva en S?", options: ["Contraste suave", "Blanco y negro", "Menos luz en todo", "Invierte colores"], explanation: "Sombras abajo, luces arriba: contraste controlado." },
    { kind: "theory", title: "Punto de negro y punto de blanco", body: ["Los extremos de la curva son el **punto de negro** y el **punto de blanco**. Moverlos hacia dentro \"estira\" la imagen: exactamente lo que hace el efecto **Levels** con *Input Black* e *Input White*."], tip: "En el simulador usamos Levels: mismo principio que los dos extremos de la curva." },
    { kind: "quiz", question: "Subir Input Black de 0 a 15 en Levels hace que…", options: ["Los grises oscuros se vuelvan negro: más contraste en sombras", "La imagen se vuelva blanca", "El audio aumente", "Nada"], explanation: "Todo lo que está por debajo de 15 se convierte en negro puro." },
    { kind: "studio", title: "Estira los tonos", instructions: "El café se ve grisáceo. Con **Levels** lleva el **Input Black** al menos a **12** y el **Input White** a **≤ 240**: negros más negros, blancos más blancos.", goals: ["Input Black ≥ **12**", "Input White ≤ **240**"] },
  ] },
  "hsl": { title: "Corrección secundaria HSL", summary: "Aislar y cambiar un solo color.", steps: [
    { kind: "theory", title: "Primaria y secundaria", body: ["La corrección **primaria** afecta toda la imagen. La **secundaria** aísla una parte: un color (con HSL), una zona (con máscara) o ambos.", "Con el **secundario HSL** de Lumetri seleccionas un color (ej. el verde del césped) y cambias su tono, saturación y luminancia sin tocar el resto."], terms: [{ term: "H", def: "Tono (Hue)" }, { term: "S", def: "Saturación" }, { term: "L", def: "Luminancia" }] },
    { kind: "quiz", question: "Quieres hacer solo el cielo más azul sin tocar las caras. ¿Qué usas?", options: ["Corrección primaria", "Secundario HSL", "Exposición", "Volumen"], explanation: "El secundario aísla un solo color." },
    { kind: "theory", title: "Rotar el tono", body: ["**Color Balance (HLS)** rota el **tono** de toda la imagen un cierto ángulo: +30° desplaza rojos hacia naranja, verdes hacia cian… Útil para entender cómo funciona la rueda de color."] },
    { kind: "quiz", question: "Rotar el tono 180° convierte el azul en…", options: ["Naranja/amarillo", "Azul más oscuro", "Gris", "Verde"], explanation: "En la rueda de color, el opuesto del azul es el naranja." },
    { kind: "studio", title: "Gira la rueda de color", instructions: "Aplica **Color Balance (HLS)** al dron y rota el **Tono** al menos **30°** (en cualquier dirección) para transformar el mar en un color de fantasía.", goals: ["Tono rotado al menos **30°**"] },
  ] },
  "maschere-colore": { title: "Máscaras y seguimiento", summary: "Corregir solo una zona de la imagen.", steps: [
    { kind: "theory", title: "Corregir una zona", body: ["Con una **máscara** limitas un efecto a una zona: aclarar solo el rostro, oscurecer solo el cielo, difuminar una matrícula.", "Una máscara **difuminada** (feather alto) hace la corrección invisible: la transición es gradual."] },
    { kind: "quiz", question: "¿Por qué difuminar el borde de una máscara de corrección?", options: ["Para hacerla invisible con una transición gradual", "Para exportar más rápido", "Para cambiar el formato", "Nunca se difumina"], explanation: "Un borde duro se notaría inmediatamente." },
    { kind: "theory", title: "Seguimiento", body: ["Si el sujeto se mueve, la máscara debe **seguirlo**: el **tracking** analiza el movimiento fotograma a fotograma y mueve la máscara automáticamente."] },
    { kind: "quiz", question: "El rostro que quieres aclarar se mueve en el plano. ¿Qué necesitas?", options: ["Tracking de la máscara", "Otra secuencia", "La regla de los 180°", "Un fotograma congelado"], explanation: "El tracking hace que la máscara siga al sujeto." },
    { kind: "studio", title: "Una luz solo sobre el sujeto", instructions: "En After Effects: hay una **capa de ajuste** sobre el vídeo. Dibuja una **máscara elíptica** (herramienta Elipse, **Q**), difumínala (**Mask Feather** ≥ **40**) y aplica **Lumetri Color** con **Exposición** ≥ **+0.5**.", hint: "Selecciona la capa de ajuste, elige la herramienta **Elipse** y arrastra en el panel de Composición. Presiona **F** para ver Mask Feather.", goals: ["Máscara en la capa de ajuste", "Feather ≥ **40**", "Lumetri con Exposición ≥ **+0.5**"] },
  ] },
  "creare-look": { title: "Crear un look", summary: "Teal & orange, vintage, blanco y negro.", steps: [
    { kind: "theory", title: "Los looks más famosos", body: ["**Teal & orange**: sombras hacia teal, piel y luces hacia naranja. Es el look de las superproducciones: separa a las personas del fondo.", "**Vintage**: negros levantados (nunca negro puro), colores apagados, un toque de grano y dominante cálida. **Blanco y negro**: todo se reduce al contraste."] },
    { kind: "quiz", question: "¿Por qué teal & orange funciona tan bien?", options: ["Porque la piel (naranja) destaca sobre su complementario (teal)", "Porque pesa menos", "Porque es en blanco y negro", "Por casualidad"], explanation: "Colores complementarios = máxima separación." },
    { kind: "theory", title: "La viñeta", body: ["Una **viñeta** sutil oscurece los bordes y lleva la mirada al centro. En Lumetri, valores **negativos** oscurecen las esquinas."] },
    { kind: "quiz", question: "¿Para qué sirve una viñeta sutil?", options: ["Para guiar la mirada hacia el centro", "Para subir el volumen", "Para estabilizar", "Para subtitular"], explanation: "Bordes oscuros, el centro se lleva el protagonismo." },
    { kind: "studio", title: "Look cinematográfico", instructions: "Crea un look de película en la ciudad: LUT **Cinematic teal & orange**, **Contraste** general ≥ **+15** y **Viñeta** ≤ **−0.5**.", goals: ["LUT teal & orange", "Contraste ≥ **+15**", "Viñeta ≤ **−0.5**"] },
    { kind: "studio", title: "Blanco y negro de autor", instructions: "Convierte la entrevista en un **blanco y negro** de alto contraste: efecto **Black & White** (o Saturación 0) y **Contraste** ≥ **+25**.", goals: ["En **blanco y negro**", "Contraste ≥ **+25**"] },
  ] },

  // Sección 4 — más corta, solo campos clave
  "composizioni": { title: "Composiciones", summary: "El contenedor de toda animación.", steps: [
    { kind: "theory", title: "La composición", body: ["En After Effects todo vive dentro de una **composición** (comp): tiene dimensiones, frame rate, **duración** y un color de fondo, como una secuencia de Premiere.", "Crea una con **Composición → Nueva composición** (**Ctrl+N**). Dentro están las **capas**, apiladas: la de arriba tapa las de abajo."] },
    { kind: "quiz", question: "¿Cuál es la diferencia principal entre una secuencia de Premiere y una composición de After Effects?", options: ["Ninguna", "La comp tiene una duración fija definida al crearla", "La comp no tiene dimensiones", "La comp no puede contener vídeo"], explanation: "En AE defines la duración al inicio; en Premiere la secuencia crece sola." },
    { kind: "theory", title: "Ajustes correctos", body: ["Para redes: **1080×1920** o **1080×1080**. Para YouTube: **1920×1080**. La **duración** es mejor ponerla un poco más larga de lo necesario: después se puede acortar con el **área de trabajo**."] },
    { kind: "quiz", question: "¿Cómo creas una nueva composición?", options: ["Ctrl+N", "Ctrl+K", "Ctrl+M", "Ctrl+D"], explanation: "Como en Premiere, N de Nuevo." },
    { kind: "studio", title: "Tu primera composición", instructions: "Crea una composición llamada **Intro**, **1920×1080**, **30 fps**, duración **10 segundos** (Composición → Nueva composición).", goals: ["Comp **1920×1080**", "A **30 fps**", "Dura **10 s**", "Llamada **Intro**"] },
    { kind: "studio", title: "Llénala", instructions: "Añade un fondo a la composición: **Capa → Nuevo → Sólido** (**Ctrl+Y**) y un **texto** con la herramienta Texto (**Ctrl+T**).", hint: "En la línea de tiempo de AE la capa de **arriba** es la que está delante: arrastra arriba o abajo para cambiar el orden.", goals: ["Un **sólido**", "Una capa de **texto**", "Texto **sobre** el fondo"] },
  ] },
  "livelli": { title: "Capas y precomposiciones", summary: "Organizar proyectos complejos.", steps: [
    { kind: "theory", title: "Muchos tipos de capas", body: ["**Sólido** (un color), **texto**, **forma**, **metraje** (vídeo, imágenes), **capa de ajuste** (aplica efectos a todo lo de abajo), **objeto nulo** (invisible, se usa para controlar otras capas)."] },
    { kind: "quiz", question: "¿Qué capa es invisible y se usa para controlar otras capas?", options: ["Sólido", "Objeto nulo", "Texto", "Forma"], explanation: "El nulo no se renderiza: es un mando." },
    { kind: "theory", title: "Precomponer", body: ["Cuando se acumulan capas, agrúpalas en una **precomposición** (**Ctrl+Shift+C**): se convierten en una sola capa que contiene una comp. Como una carpeta que se anima como un todo."] },
    { kind: "quiz", question: "¿Qué atajo precompone las capas seleccionadas?", options: ["Ctrl+Shift+C", "Ctrl+D", "Ctrl+K", "Alt+P"], explanation: "C de Componer: Ctrl+Shift+C." },
    { kind: "studio", title: "Agrupa el título", instructions: "Selecciona el texto **SQUEAK** y la forma **Bar** y **precompón** (Ctrl+Shift+C). En la comp principal debería aparecer una capa de **composición** en su lugar.", goals: ["Existe una capa de **precomposición**", "El texto está dentro de la precomp"] },
    { kind: "studio", title: "Un nulo de control", instructions: "Añade un **objeto nulo** (Capa → Nuevo → Objeto nulo) y renómbralo **Control** (Enter sobre el nombre).", goals: ["Un **objeto nulo**", "Llamado **Control**"] },
  ] },
  "forme": { title: "Capas de forma", summary: "Dibujar y animar formas vectoriales.", steps: [
    { kind: "theory", title: "Formas vectoriales", body: ["Las **capas de forma** se dibujan con las herramientas Rectángulo, Elipse, Estrella (**Q** para ciclar). Son **vectoriales**: puedes escalarlas cuanto quieras sin perder calidad.", "Cada forma tiene **Relleno**, **Trazo** y propiedades animables como **Tamaño**."] },
    { kind: "quiz", question: "¿Por qué las formas vectoriales no pierden calidad al agrandarse?", options: ["Se dibujan con fórmulas, no con píxeles", "Están en 4K", "Son en blanco y negro", "No es cierto"], explanation: "Los vectores recalculan en cada tamaño." },
    { kind: "theory", title: "La animación \"pop\"", body: ["La entrada más usada en motion graphics es el **pop**: la forma empieza desde **0** y crece a su tamaño, a menudo con un pequeño **rebote** (sobrepasa y vuelve)."] },
    { kind: "quiz", question: "Una animación \"pop\" empieza desde un tamaño de…", options: ["0", "100", "1000", "−50"], explanation: "De nada al tamaño completo: aparece creciendo." },
    { kind: "studio", title: "Dibuja una estrella", instructions: "Dibuja una **estrella** con la herramienta Estrella (**Q** hasta encontrarla) en el panel de Composición.", goals: ["Una capa de forma **estrella**"] },
    { kind: "studio", title: "Hazla explotar (pop)", instructions: "Anima el **Tamaño** de la forma **Cheese**: keyframe en **0** luego hasta tamaño completo (al menos 200), con **Easy Ease**.", goals: ["Al menos 2 keyframes de **Tamaño**", "Empieza desde ~0 y llega a ≥ 200", "Con **Easy Ease**"] },
  ] },
  "maschere-matte": { title: "Máscaras y track matte", summary: "Mostrar solo una parte de una capa.", steps: [
    { kind: "theory", title: "Máscaras", body: ["Una **máscara** es un trazado dibujado sobre una capa: solo el interior queda visible. Con **Feather** el borde se suaviza, con **Expansión** la máscara crece o se encoge.", "Animar la expansión crea un **reveal**: la imagen se abre desde el centro."] },
    { kind: "quiz", question: "¿Qué propiedad de la máscara suaviza el borde?", options: ["Feather", "Opacidad", "Expansión", "Rotación"], explanation: "Feather suaviza el borde." },
    { kind: "theory", title: "Track matte", body: ["Un **track matte** usa una capa (ej. texto) como máscara para la de abajo: el vídeo se ve **dentro de las letras**. Es el efecto de \"títulos rellenos con imagen\"."] },
    { kind: "quiz", question: "Quieres que el vídeo se vea dentro de las letras de un título. ¿Qué usas?", options: ["Un track matte", "Un fotograma congelado", "Un nulo", "Una expresión"], explanation: "El texto actúa como una ventana sobre el vídeo." },
    { kind: "studio", title: "Efecto foco de luz", instructions: "Sobre el dron dibuja una **máscara elíptica** (herramienta Elipse con la capa seleccionada) y difumínala con **Mask Feather** ≥ **60**.", goals: ["Una **máscara elíptica**", "Feather ≥ **60**"] },
    { kind: "studio", title: "Reveal", instructions: "Ahora anima la **Mask Expansion** del dron: de muy negativo (≤ **−200**, máscara cerrada) a **0** o más, para que la imagen se abra.", goals: ["Al menos 2 keyframes de **Expansión**", "De cerrada (≤ −200) a abierta (≥ 0)"] },
  ] },
  "parenting": { title: "Parentado", summary: "Vincular capas que se mueven juntas.", steps: [
    { kind: "theory", title: "Padre e hijo", body: ["Con el **parentado** una capa (hijo) sigue todos los movimientos de otra (padre): posición, escala, rotación. El hijo también puede tener sus propios movimientos.", "Se hace desde la columna **Parent** en la línea de tiempo: menú desplegable o el **pick whip** arrastrado hacia el padre."] },
    { kind: "quiz", question: "Si rotas el padre, ¿qué hace el hijo?", options: ["Se queda quieto", "Rota con el padre", "Desaparece", "Se duplica"], explanation: "El hijo hereda las transformaciones del padre." },
    { kind: "theory", title: "El nulo como titiritero", body: ["Truco pro: vincula varias capas a un **objeto nulo** y anima solo el nulo. Mueve, rota o escala todo el grupo con un solo juego de keyframes."] },
    { kind: "quiz", question: "Quieres mover logo, texto y barra juntos. ¿Qué haces?", options: ["Vincularlos a un nulo y animar el nulo", "Animar cada uno por separado", "Exportarlos", "Usar una transición"], explanation: "Un control para todo el grupo." },
    { kind: "studio", title: "El brazo sigue al cuerpo", instructions: "El **Body** ya se mueve. Vincula el **Arm** al Body como **padre** (columna Parent).", goals: ["Arm → padre **Body**"] },
    { kind: "studio", title: "El titiritero", instructions: "Crea un **objeto nulo**, vincula **tanto el logo como el texto** al nulo y anima la **Rotación** del nulo (al menos 2 keyframes).", goals: ["Un **objeto nulo**", "Logo y texto son hijos del nulo", "El nulo rota (2 keyframes)"] },
  ] },
  "animatori-testo": { title: "Animadores de texto", summary: "Animar letra por letra.", steps: [
    { kind: "theory", title: "Animar texto desde dentro", body: ["Los **animadores de texto** cambian propiedades (opacidad, posición, tracking…) **letra por letra** usando un **selector de rango** que decide qué letras se afectan.", "Animar el **End** del selector de 0% a 100% hace que las letras aparezcan una a una; animar el **Tracking** hace que el título \"se abra\"."] },
    { kind: "quiz", question: "¿Qué decide el selector de rango?", options: ["Qué letras se animan", "Color del texto", "Duración de la comp", "Fuente"], explanation: "Start, End y Offset eligen las letras." },
    { kind: "theory", title: "El tracking de apertura", body: ["Un clásico de tráiler: el título aparece con letras **apretadas** y lentamente **se separan**. Anima el **Tracking** del animador."] },
    { kind: "quiz", question: "¿Qué propiedad animas para un título estilo tráiler que \"respira\"?", options: ["Tracking", "Opacidad de la capa", "Volumen", "Duración"], explanation: "Las letras se separan lentamente." },
    { kind: "studio", title: "Título de tráiler", instructions: "Abre el **Animador 1** en el texto y anima el **Tracking**: de **0** a al menos **200** en 2–4 segundos.", goals: ["Al menos 2 keyframes de **Tracking**", "De ~0 a al menos **200**"] },
    { kind: "studio", title: "Letra por letra", instructions: "Ahora haz que el texto aparezca letra por letra: anima **Range Selector: End** de **0%** a **100%**.", goals: ["End de **0%**", "…a **100%**"] },
  ] },
  "titoli-cinetici": { title: "Tipografía cinética", summary: "Palabras que siguen la voz.", steps: [
    { kind: "theory", title: "Palabras que se mueven", body: ["La **tipografía cinética** hace que las palabras aparezcan **al ritmo de la voz**: cada palabra entra cuando se pronuncia, con diferentes tamaños y movimientos para dar énfasis.", "Las palabras importantes son **más grandes** y permanecen más tiempo; las de conexión son más pequeñas y rápidas."] },
    { kind: "quiz", question: "En tipografía cinética, ¿cómo enfatizas una palabra clave?", options: ["Más grande y con más tiempo en pantalla", "Más pequeña y rápida", "Ocultándola", "En gris"], explanation: "Jerarquía visual = jerarquía de significado." },
    { kind: "theory", title: "Escalonamiento", body: ["Las entradas deben ser **escalonadas**: la segunda palabra empieza unos fotogramas después de la primera. En AE basta con desplazar las capas en el tiempo, o usar **Animación → Asistente de keyframes → Secuenciar capas**."] },
    { kind: "quiz", question: "¿Qué significa escalonar las animaciones?", options: ["Empezarlas una detrás de otra", "Empezarlas todas a la vez", "Borrarlas", "Exportarlas"], explanation: "Un pequeño retraso entre elementos crea ritmo." },
    { kind: "studio", title: "Tres palabras, tres tiempos", instructions: "Haz que las tres palabras **APRENDE**, **A** y **EDITAR** entren con un **Scale** pop (de 0 a 100), una **tras otra**: los primeros keyframes deben empezar en momentos diferentes (al menos 0.2 s de separación).", goals: ["Las 3 palabras tienen un **Scale** pop", "Entradas **escalonadas**"] },
  ] },
  "typewriter": { title: "Efecto máquina de escribir", summary: "Texto que aparece carácter a carácter.", steps: [
    { kind: "theory", title: "Una letra a la vez", body: ["El efecto **máquina de escribir** hace que el texto aparezca **un carácter a la vez**, como si alguien estuviera tecleando. Perfecto para mensajes, fechas, ubicaciones.", "En AE animas el **Range Selector End** de 0% a 100% (o usas el preset *Typewriter*)."] },
    { kind: "quiz", question: "¿Qué propiedad animas para el efecto máquina de escribir?", options: ["Range selector End", "Escala de la capa", "Color de fondo", "Duración de la comp"], explanation: "De 0% a 100%: las letras aparecen una tras otra." },
    { kind: "theory", title: "Con expresiones", body: ["En vez de keyframes puedes escribir una **expresión** en la propiedad (Alt+clic en el cronómetro): por ejemplo **linear(time, 0, 2, 0, 100)** lleva el valor de 0 a 100 en los primeros 2 segundos."] },
    { kind: "quiz", question: "¿Qué hace la expresión linear(time, 0, 2, 0, 100)?", options: ["Va de 0 a 100 en los primeros 2 segundos", "Repite para siempre", "Genera números aleatorios", "Nada"], explanation: "Convierte el tiempo 0–2 s en el rango 0–100." },
    { kind: "studio", title: "Teclea el mensaje", instructions: "Haz que **¡Hola, soy Squeak!** aparezca como máquina de escribir: **Range End** de **0** a **100%** en al menos **1.5 segundos**.", goals: ["Empieza en **0%**", "Llega a **100%**", "Dura al menos **1.5 s**"] },
    { kind: "studio", title: "Con una expresión", instructions: "Hazlo de nuevo **sin keyframes**: Alt+clic en el cronómetro de **Range End** y escribe una expresión con **linear** y **time** (ej. **linear(time, 0, 2, 0, 100)**).", goals: ["Expresión con **linear** y **time**"] },
  ] },
  "lower-third-animato": { title: "Lower third animado", summary: "Entrada y salida suaves.", steps: [
    { kind: "theory", title: "Cómo entra un lower third", body: ["Un lower third animado suele tener **dos partes**: una **barra** (forma) que se desliza y el **texto** que aparece justo después. En la salida, el orden se invierte.", "Las entradas duran **10–20 fotogramas** y siempre llevan **easing**: rápido al inicio, suave en la llegada."] },
    { kind: "quiz", question: "¿Cuánto dura normalmente la entrada de un lower third?", options: ["10–20 fotogramas", "5 segundos", "1 fotograma", "1 minuto"], explanation: "Corta y ágil, pero suave al llegar." },
    { kind: "theory", title: "Orden y ritmo", body: ["Primero la barra, luego el texto (aunque solo 4–6 fotogramas después): el ojo sigue el movimiento y llega preparado para leer."] },
    { kind: "quiz", question: "En la salida, ¿qué desaparece primero?", options: ["Texto, luego barra", "Barra, luego texto", "Todo a la vez siempre", "Nada"], explanation: "Se invierte el orden de entrada." },
    { kind: "studio", title: "La barra entra", instructions: "Haz que la **barra se deslice** desde la izquierda: dos keyframes de **Posición** con al menos **600 px** de movimiento en X y **Easy Ease**.", goals: ["2 keyframes de Posición en **Bar**", "Movimiento ≥ **600 px** en X", "Con **Easy Ease**"] },
    { kind: "studio", title: "Luego el texto", instructions: "Completa: el **texto** aparece con **Opacidad** de 0 a 100 **después** de que la barra empiece a moverse (primer keyframe al menos 0.1 s después del de la barra).", goals: ["Texto con fade (0 → 100)", "Empieza después de la barra"] },
  ] },
  "logo-animato": { title: "Logo animado", summary: "Una intro de 3 segundos para tu canal.", steps: [
    { kind: "theory", title: "Corto y reconocible", body: ["Una intro de canal dura **2–4 segundos**: más larga y la gente salta. El logo entra con un movimiento claro, se detiene un momento y empieza el vídeo.", "Un **rebote** (overshoot) añade personalidad: el logo crece más allá del tamaño final (110%) y vuelve a 100%."] },
    { kind: "quiz", question: "¿Cuánto debe durar una intro de canal?", options: ["2–4 segundos", "30 segundos", "1 minuto", "Lo más larga posible"], explanation: "Corta: el espectador está ahí por el contenido." },
    { kind: "theory", title: "Luz y sonido", body: ["Un sutil **resplandor**, un destello o reflejo, y sobre todo un **sonido** (whoosh, impacto) hacen la intro memorable."] },
    { kind: "quiz", question: "¿Qué es el overshoot?", options: ["Pasar del valor final y rebotar", "Exportar dos veces", "Un error de render", "Un códec"], explanation: "El rebote que da vida a los movimientos." },
    { kind: "studio", title: "Pop con rebote", instructions: "Anima la **Escala** del logo con **3 keyframes**: **0** → más de **105** → alrededor de **100** (el rebote).", goals: ["Al menos **3 keyframes de Escala**", "Empieza desde ~0", "Pasa de **105** y acaba en ~**100**"] },
    { kind: "studio", title: "Añade el resplandor", instructions: "Haz que el logo brille: aplica el efecto **Glow** (Estilizar) y sube el **Glow Radius** a al menos **30**.", goals: ["**Glow** con radio ≥ 30"] },
  ] },
  "green-screen": { title: "Pantalla verde", summary: "Keying con croma key.", steps: [
    { kind: "theory", title: "Croma key", body: ["Se filma al sujeto delante de un fondo **verde** (o azul), iluminado uniformemente. El **croma key** hace ese color transparente y pones otro fondo detrás.", "Se usa verde porque está lejos de los tonos de piel y los sensores son muy sensibles al verde."] },
    { kind: "quiz", question: "¿Por qué el fondo es verde?", options: ["Porque está lejos de los tonos de piel", "Porque les gusta a los directores", "Porque es más barato", "Por casualidad"], explanation: "Para que el key no se coma al sujeto." },
    { kind: "theory", title: "Refinar el key", body: ["Después de elegir el color del key se ajustan **tolerancia** y **suavidad** y se elimina el **spill** (el reflejo verde en los bordes del sujeto)."] },
    { kind: "quiz", question: "¿Qué es el spill?", options: ["Reflejo verde sobre el sujeto", "Un tipo de transición", "Un error de audio", "La duración del key"], explanation: "El fondo de color se refleja en los bordes: hay que neutralizarlo." },
    { kind: "studio", title: "Elimina el verde de Squeak", instructions: "La capa **Greenscreen_Squeak** está sobre el dron. Aplica **Ultra Key** (Keying) para eliminar el verde, con **Spill Suppression** activo.", goals: ["**Ultra Key** sobre la pantalla verde", "Spill Suppression activo"] },
    { kind: "studio", title: "Colócalo en la escena", instructions: "Reduce a Squeak (Escala ≤ **70**) y muévelo a la **mitad derecha** de la escena (X > 960).", goals: ["Escala ≤ **70**", "A la derecha"] },
  ] },
  "tracking": { title: "Seguimiento de movimiento", summary: "Anclar un elemento a un objeto en movimiento.", steps: [
    { kind: "theory", title: "Seguir el movimiento", body: ["El **motion tracking** analiza un punto de la imagen fotograma a fotograma y extrae keyframes de **posición**. Luego \"anclas\" un texto, logo o efecto a esos datos.", "En AE aplicas los datos a un **objeto nulo** y haces padre las capas al nulo."] },
    { kind: "quiz", question: "¿A qué se suelen aplicar los datos de tracking?", options: ["A un objeto nulo", "Directamente al audio", "A la comp", "Al panel Proyecto"], explanation: "El nulo se convierte en el punto que se mueve con el objeto." },
    { kind: "theory", title: "Tracking manual", body: ["Cuando el auto-tracking falla, hazlo a mano: keyframes de posición en el nulo cada pocos fotogramas, siguiendo el objeto. Lento, pero siempre funciona."] },
    { kind: "quiz", question: "Después del tracking, ¿cómo anclas el texto al nulo?", options: ["Con parentado", "Con una transición", "Copiando el archivo", "No se puede"], explanation: "El texto se convierte en hijo del nulo y lo sigue." },
    { kind: "studio", title: "Tracking manual", instructions: "Crea un **objeto nulo**, ponle al menos **3 keyframes de Posición** (uno por segundo) y haz padre el **texto** al nulo.", goals: ["Nulo con **3+ keyframes de Posición**", "Texto sigue al nulo"] },
    { kind: "studio", title: "Vincular con expresión", instructions: "Alternativa al parentado: escribe en la **Posición** del texto una expresión que lea la posición del nulo, ej. **thisComp.layer(\"Target\").transform.position**.", goals: ["Expresión que lee **Target**"] },
  ] },
  "stabilizzazione": { title: "Estabilización", summary: "Quitar el temblor del metraje a mano.", steps: [
    { kind: "theory", title: "El temblor", body: ["El metraje grabado **a mano** tiembla. El **Warp Stabilizer** analiza el clip y compensa el movimiento, luego **agranda** ligeramente la imagen para ocultar los bordes que se mueven.", "Cuanta más **suavidad** pidas, más se recorta la imagen (y pierde calidad)."] },
    { kind: "quiz", question: "¿Por qué el estabilizador agranda la imagen?", options: ["Para ocultar los bordes que se mueven", "Para aumentar la resolución", "Para cambiar el formato", "No lo hace"], explanation: "Compensar el movimiento deja zonas vacías en los bordes." },
    { kind: "theory", title: "No te pases", body: ["Un **20–50%** de suavidad suele ser suficiente. Al 100% el metraje se ve \"gomoso\" y muy recortado. Si el plano tiembla demasiado, mejor cambiar a otro plano."] },
    { kind: "quiz", question: "¿Qué nivel de suavidad es generalmente razonable?", options: ["20–50%", "Siempre 100%", "0%", "500%"], explanation: "Suficiente para quitar el temblor sin deformar." },
    { kind: "studio", title: "Estabiliza en Premiere", instructions: "El metraje de la ciudad tiembla. Aplica **Warp Stabilizer** (Efectos de vídeo → Distorsión) con **Suavidad** entre **20** y **50%**.", goals: ["**Warp Stabilizer** aplicado", "Suavidad **20–50%**"] },
  ] },
  "blending": { title: "Modos de fusión", summary: "Screen, multiply y overlay.", steps: [
    { kind: "theory", title: "Cómo se mezclan las capas", body: ["El **modo de fusión** decide cómo una capa se mezcla con las de abajo. **Screen** conserva solo las partes brillantes: perfecto para luces, llamas, reflejos sobre negro.", "**Multiply** conserva las partes oscuras (sombras, texturas sobre blanco). **Overlay** aumenta el contraste mezclando ambos."] },
    { kind: "quiz", question: "Tienes una explosión sobre fondo negro. ¿Qué modo elimina el negro?", options: ["Screen", "Multiply", "Normal", "Difference"], explanation: "Screen elimina el negro y conserva la luz." },
    { kind: "theory", title: "Dónde cambiarlo", body: ["En AE la columna **Mode** en la línea de tiempo (pulsa **F4** si no la ves). En Premiere: **Controles de efectos → Opacidad → Modo de fusión**."] },
    { kind: "quiz", question: "Una textura de papel sobre fondo blanco: ¿qué modo para conservar solo las partes oscuras?", options: ["Multiply", "Screen", "Add", "Normal"], explanation: "Multiply elimina el blanco." },
    { kind: "studio", title: "Luz cálida sobre el mar", instructions: "La capa **Light** (naranja) cubre todo el dron. Ponla en modo **Screen** (o **Add**) y baja su **Opacidad** a **≤ 60%**.", goals: ["Modo **Screen** o **Add**", "Opacidad ≤ **60%**"] },
    { kind: "studio", title: "Texto en relieve", instructions: "Pon el texto **WAVE** en modo **Overlay** sobre el dron: parecerá parte de la imagen.", goals: ["Texto en **Overlay**"] },
  ] },
  "particelle": { title: "Partículas", summary: "Polvo, destellos y nieve.", steps: [
    { kind: "theory", title: "Sistemas de partículas", body: ["Un **sistema de partículas** genera cientos de elementos pequeños (puntos, destellos, copos) con reglas: cuántos nacen, cuánto viven, hacia dónde van, cuánto pesan.", "En AE existen **CC Particle World** (incluido) y plugins como **Trapcode Particular**. Se usan para nieve, polvo, destellos, magia."] },
    { kind: "quiz", question: "¿Qué controla la \"vida\" de una partícula?", options: ["Cuánto tiempo permanece visible antes de desaparecer", "Su color", "Formato de la comp", "Volumen"], explanation: "Cada partícula nace, vive y desaparece." },
    { kind: "theory", title: "Partículas artesanales", body: ["Para pocos elementos puedes hacerlo manualmente: unas pocas formas pequeñas, duplicadas (**Ctrl+D**), con una expresión **wiggle** en la posición para que floten al azar.", "**wiggle(1, 50)**: una vez por segundo se mueve aleatoriamente hasta 50 píxeles."] },
    { kind: "quiz", question: "¿Qué hace la expresión wiggle(2, 30)?", options: ["Se mueve aleatoriamente 2 veces por segundo hasta 30 px", "Rota 30°", "Duplica la escala", "Detiene la capa"], explanation: "Frecuencia 2, amplitud 30." },
    { kind: "studio", title: "Copos de nieve", instructions: "Crea al menos **5** formas pequeñas (duplica el **Flake** con **Ctrl+D**) y escribe una expresión **wiggle** en la **Posición** de al menos **3** de ellas.", hint: "Escribe la expresión en el primer copo **antes** de duplicar: ¡las copias la heredan!", goals: ["Al menos **5** formas", "**3+** con wiggle en Posición"] },
  ] },

  // Sección 5
  "proxy": { title: "Proxies", summary: "Editar 4K en cualquier portátil.", steps: [
    { kind: "theory", title: "Archivos ligeros para editar", body: ["Los **proxies** son copias **ligeras** (baja resolución, códec fácil) de los archivos originales pesados. Editas con proxies, el ordenador no sufre, y al exportar Premiere usa automáticamente los **originales**.", "En Premiere: clic derecho en los clips → **Proxy → Crear proxies**, luego el botón **Toggle Proxies** en el monitor."] },
    { kind: "quiz", question: "Al exportar, Premiere usa…", options: ["Los proxies", "Los archivos originales", "Uno al azar", "Ninguno"], explanation: "Los proxies solo son para editar cómodamente." },
    { kind: "theory", title: "Organizar proxies y originales", body: ["Mantén proxies y originales en **carpetas separadas** en disco con los **mismos nombres**: se reenlazarán sin problemas."], tip: "Una alternativa rápida: bajar la resolución de reproducción del Monitor de programa a 1/2 o 1/4." },
    { kind: "quiz", question: "¿Por qué deben tener el mismo nombre proxies y originales?", options: ["Para reenlazarse fácilmente", "Para ahorrar espacio", "Para el color", "No es necesario"], explanation: "El enlace se basa en los nombres." },
    { kind: "studio", title: "Prepara el proyecto para proxies", instructions: "Crea dos carpetas, **Originales** y **Proxies**, y mueve **al menos 2 vídeos** a la carpeta **Originales**.", goals: ["Carpeta **Originales**", "Carpeta **Proxies**", "Al menos 2 vídeos en Originales"] },
    { kind: "match", title: "Empareja", pairs: [["Proxy", "Copia ligera"], ["Original", "Archivo pesado de calidad"], ["Exportación", "Usa los originales"], ["1/4", "Resolución de reproducción reducida"]] },
  ] },
  "gestione-progetto": { title: "Gestión del proyecto", summary: "Carpetas, nombres y versiones.", steps: [
    { kind: "theory", title: "Nombres que hablan", body: ["Un buen nombre dice **cliente, proyecto, tipo y versión**: *Pizzeria_Spot30s_v3*. Nunca *final*, *final2*, *final_DE_VERDAD*: después de una semana nadie sabe cuál es el bueno.", "El número de **versión** aumenta con cada entrega al cliente."] },
    { kind: "quiz", question: "¿Qué nombre de secuencia es mejor?", options: ["final_definitivo2", "Pizzeria_Spot30s_v3", "Secuencia 01", "aaa"], explanation: "Cliente, formato y versión: claro para siempre." },
    { kind: "theory", title: "Una estructura que se repite", body: ["Cada proyecto con las mismas carpetas: **01_Video**, **02_Audio**, **03_Graficos**, **04_Export**. Encuentras todo incluso años después."] },
    { kind: "quiz", question: "¿Por qué usar siempre la misma estructura de carpetas?", options: ["Para encontrar todo rápido en cualquier proyecto", "Para ahorrar espacio", "Es obligatorio", "No es necesario"], explanation: "El hábito ahorra tiempo y errores." },
    { kind: "studio", title: "Renombra y organiza", instructions: "Renombra la secuencia a **Pizzeria_Spot_v1** (doble clic en el nombre en el panel Proyecto) y crea una carpeta **Export**.", goals: ["Secuencia **…_v1**", "Carpeta **Export**"] },
  ] },
  "backup": { title: "Copias de seguridad", summary: "La regla 3-2-1.", steps: [
    { kind: "theory", title: "La regla 3-2-1", body: ["**3** copias de los datos, en **2** soportes diferentes, con **1** fuera del sitio (nube o un disco en casa de alguien). Los discos fallan: solo es cuestión de cuándo.", "El metraje original es lo más valioso: sin él, el proyecto no se puede rehacer."] },
    { kind: "quiz", question: "¿Qué significa el \"1\" de la regla 3-2-1?", options: ["Una copia fuera del sitio", "Un solo disco", "Un backup al año", "Un archivo"], explanation: "Si pasa algo en la casa u oficina, esa copia sobrevive." },
    { kind: "theory", title: "Guarda a menudo", body: ["**Ctrl+S** cada pocos minutos, y **Guardar como** con nueva versión antes de cambios importantes. Premiere también hace guardados automáticos en la carpeta *Auto-Save*."] },
    { kind: "quiz", question: "Antes de un cambio drástico, ¿qué deberías hacer?", options: ["Guardar una nueva versión del proyecto", "Cerrar sin guardar", "Borrar el metraje", "Nada"], explanation: "Así puedes volver atrás en cualquier momento." },
    { kind: "studio", title: "Versiona y guarda", instructions: "Haz un cambio (corta el clip con **Ctrl+K**), renombra la secuencia a **…_v2** y **guarda** con **Ctrl+S**.", goals: ["Se hizo un cambio", "Secuencia **…_v2**", "Proyecto **guardado**"] },
  ] },
  "collaborazione": { title: "Colaboración", summary: "Revisiones y feedback del cliente.", steps: [
    { kind: "theory", title: "Revisiones", body: ["El cliente ve una **copia de revisión** y deja **comentarios con timecodes** (\"en 00:00:12 quita el texto\"). Herramientas como Frame.io conectan los comentarios directamente con la línea de tiempo.", "Cada ronda de correcciones es una **revisión**: el presupuesto debería indicar cuántas se incluyen (normalmente 2)."] },
    { kind: "quiz", question: "¿Por qué los comentarios deben llevar timecodes?", options: ["Para saber exactamente dónde hacer los cambios", "Para alargar el vídeo", "Para el color", "No es necesario"], explanation: "\"La parte del medio\" es impreciso; 00:00:12:05 no lo es." },
    { kind: "theory", title: "Marcadores como recordatorios", body: ["Convierte cada comentario en un **marcador** en la línea de tiempo con el texto en el campo **Comentarios** (doble clic en el marcador). Luego resuélvelos uno a uno."] },
    { kind: "quiz", question: "¿Cómo conviertes un comentario del cliente en un recordatorio en la línea de tiempo?", options: ["Con un marcador con comentario", "Con una transición", "Con una nueva secuencia", "No se puede"], explanation: "Doble clic en el marcador → Comentarios." },
    { kind: "studio", title: "Anota las correcciones", instructions: "El cliente pidió dos cambios. Añade **2 marcadores** y escribe un **comentario** en cada uno (doble clic en el marcador).", goals: ["Al menos **2 marcadores**", "Con un **comentario** escrito"] },
  ] },
  "consegna-cliente": { title: "Entrega al cliente", summary: "Plazos, revisiones y facturación.", steps: [
    { kind: "theory", title: "Antes de empezar", body: ["Un **presupuesto** claro evita disputas: qué harás, para cuándo, **cuántas revisiones**, formatos de entrega y el precio (con señal, a menudo 30–50%).", "Las revisiones extra se cobran aparte: escríbelo desde el principio."] },
    { kind: "quiz", question: "¿Qué debe contener un presupuesto?", options: ["Trabajo, plazos, revisiones incluidas, formatos y precio", "Solo el precio", "Solo la fecha", "Nada, basta con la palabra"], explanation: "Todo por escrito: protege a ambas partes." },
    { kind: "theory", title: "La copia de revisión", body: ["Para las revisiones envía una copia **ligera** (720p, bajo bitrate) con **timecode incrustado** (efecto Timecode): el cliente puede citar el punto exacto y no puede usar el vídeo sin pagar."] },
    { kind: "quiz", question: "¿Por qué incrustar timecode en la copia de revisión?", options: ["Para referencias precisas y proteger el trabajo", "Por estética", "Para mayor calidad", "Para el color"], explanation: "Doble beneficio: precisión y protección." },
    { kind: "studio", title: "Copia de revisión", instructions: "Prepara la copia para el cliente: aplica el efecto **Timecode** (Vídeo) a un clip, luego exporta en **H.264** a **1280×720** con bitrate **≤ 5 Mbps**.", hint: "Aún mejor: pon el Timecode en una **capa de ajuste** en V2, para que cubra toda la secuencia.", goals: ["**Timecode** incrustado", "Exportación **1280×720** H.264", "Bitrate ≤ **5 Mbps**"] },
  ] },
  "verticale": { title: "El formato 9:16", summary: "Reencuadrar un vídeo horizontal.", steps: [
    { kind: "theory", title: "De horizontal a vertical", body: ["Para convertir un vídeo 16:9 en 9:16 crea una secuencia de **1080×1920** y **agranda** el clip (escala ~178%) hasta que llene la pantalla. Luego **reencuadra**: mueve la imagen para mantener al sujeto centrado.", "Premiere también tiene **Auto Reframe**, que sigue al sujeto automáticamente."] },
    { kind: "quiz", question: "¿Qué escala se necesita para llenar 1080×1920 con un vídeo 1920×1080?", options: ["Alrededor de 100%", "Alrededor de 178%", "Alrededor de 50%", "Alrededor de 300%"], explanation: "1920 / 1080 ≈ 1.78: hay que agrandar la altura a 1920." },
    { kind: "theory", title: "Seguir al sujeto", body: ["Si el sujeto se mueve, anima la **Posición** con unos keyframes: un reencuadre manual, más preciso que el automático."] },
    { kind: "quiz", question: "El sujeto sale del encuadre vertical. ¿Qué animas?", options: ["Posición", "Volumen", "Duración", "Saturación"], explanation: "Mueves la imagen dentro del encuadre." },
    { kind: "studio", title: "Reencuadra a vertical", instructions: "Crea una secuencia **1080×1920**, pon la **entrevista** dentro, escala al menos **175%** y anima la **Posición** con al menos **2 keyframes** para mantener la cara centrada.", goals: ["Secuencia **1080×1920** con entrevista", "Escala ≥ **175%**", "Posición animada"] },
  ] },
  "hook": { title: "El gancho de los primeros 3 segundos", summary: "Atrapar al espectador de inmediato.", steps: [
    { kind: "theory", title: "Tres segundos para convencer", body: ["En redes sociales la gente decide en **1–3 segundos** si se queda. Los primeros momentos necesitan **movimiento**, una **pregunta** o una **promesa** (\"Así es como…\"), y a menudo texto grande.", "Nunca empieces con logos lentos, saludos o panorámicas estáticas."] },
    { kind: "quiz", question: "¿Qué apertura funciona mejor para un Reel?", options: ["Un logo girando 5 segundos", "La acción más espectacular con texto", "Una panorámica estática", "\"Hola a todos, hoy…\" lentamente"], explanation: "Lo mejor desde el principio: los que hacen scroll deben pararse." },
    { kind: "theory", title: "El truco del \"flash forward\"", body: ["Toma el mejor momento del vídeo y **ponlo al principio** como adelanto, luego reinicia desde el inicio: el espectador se queda para ver cómo se llega ahí."] },
    { kind: "quiz", question: "¿Qué es un flash forward en la apertura?", options: ["Mostrar el mejor momento al inicio", "Un tipo de LUT", "Un efecto de audio", "Una transición"], explanation: "Una promesa visual de lo que viene." },
    { kind: "studio", title: "Una apertura que enganche", instructions: "Este vídeo empieza con 5 segundos de atardecer estático. Pon un clip dinámico (**ciudad** o **dron**) **al principio**, de **≤ 3 s**, y añade **texto** que aparezca en el primer segundo.", goals: ["Abre con ciudad o dron", "Primer clip ≤ **3 s**", "Texto en el primer segundo"] },
  ] },
  "sottotitoli-dinamici": { title: "Subtítulos dinámicos", summary: "Palabras resaltadas al ritmo.", steps: [
    { kind: "theory", title: "El estilo creador", body: ["Los **subtítulos dinámicos** muestran **pocas palabras a la vez** (1–3), grandes, centradas, con la palabra clave **coloreada** y un pequeño **pop** de escala en cada entrada.", "Mantienen los ojos pegados a la pantalla y funcionan incluso sin sonido."] },
    { kind: "quiz", question: "¿Cuántas palabras a la vez en un subtítulo dinámico?", options: ["1–3", "La frase entera", "Un párrafo", "Ninguna"], explanation: "Pocas y grandes, al ritmo de la voz." },
    { kind: "theory", title: "Resaltado", body: ["La palabra más importante de la frase lleva el **color de marca** (amarillo, verde…) o un tamaño más grande. El resto queda blanco con contorno."] },
    { kind: "quiz", question: "¿Cómo resaltas la palabra clave?", options: ["Con un color diferente o tamaño más grande", "Ocultándola", "En gris pequeño", "No se resalta"], explanation: "El color guía la atención." },
    { kind: "studio", title: "Palabras que saltan", instructions: "Hay 3 palabras. Dale a **todas** un **Scale** pop (de ~0 a 100) y colorea **una** palabra de un color diferente al blanco (en el panel **Carácter**).", goals: ["Scale pop en las 3", "Una palabra **coloreada**"] },
  ] },
  "ritmo-reel": { title: "Ritmo de Reel", summary: "Cortes rápidos sobre la música.", steps: [
    { kind: "theory", title: "Rápido, pero no aleatorio", body: ["Un reel dinámico cambia de plano cada **0.5–1.5 segundos**, pero **en los beats de la música**: el ritmo debe sentirse, no confundir.", "Varía la duración: unos cortes superficialmente rápidos, luego un plano que respira, luego rápido de nuevo."] },
    { kind: "quiz", question: "¿Cada cuánto se corta en un reel dinámico?", options: ["0.5–1.5 segundos", "10 segundos", "1 minuto", "Nunca"], explanation: "Rápido pero legible." },
    { kind: "theory", title: "Primero marcadores", body: ["Marca los beats con **M** durante la reproducción, luego edita enganchándote a los marcadores. Mismo método que la lección de ritmo, solo que más rápido."] },
    { kind: "quiz", question: "¿Cuál es la forma más rápida de cortar al ritmo?", options: ["Marcadores en los beats + snapping", "A ojo", "Cortes aleatorios", "Un tutorial de 2 horas"], explanation: "La cuadrícula de marcadores hace la mitad del trabajo." },
    { kind: "studio", title: "Reel al ritmo", instructions: "Los marcadores están en los beats (cada 0.8 s). Edita al menos **6 fragmentos** en V1, cada uno **≤ 1.3 s**, sin huecos, con al menos **4 cortes** en los marcadores.", hint: "Cuchilla (**C**) en cada marcador, luego ripple delete los sobrantes.", goals: ["Al menos **6 fragmentos**", "Cada uno ≤ **1.3 s**", "Sin huecos", "**4+ cortes** en marcadores"] },
  ] },
  "thumbnail": { title: "La miniatura", summary: "La portada que hace que la gente haga clic.", steps: [
    { kind: "theory", title: "La portada vende el vídeo", body: ["En YouTube la **miniatura** decide si alguien hace clic. Reglas: **cara** expresiva, **pocas palabras** (máx. 3–4) **muy grandes**, colores **contrastados**, legible incluso en pequeño.", "Formato: **1280×720** (16:9)."] },
    { kind: "quiz", question: "¿Cuántas palabras como máximo en una buena miniatura?", options: ["3–4", "20", "Un párrafo", "Sin límite"], explanation: "Debe leerse en un instante, incluso en el móvil." },
    { kind: "theory", title: "Texto que destaca", body: ["El texto lleva un **contorno** grueso o **sombra** fuerte, para leerse sobre cualquier fondo. Amarillo, blanco y rojo son los clásicos."] },
    { kind: "quiz", question: "¿Qué tamaño tiene una miniatura de YouTube?", options: ["1280×720", "500×500", "1080×1920", "4000×4000"], explanation: "16:9 a 1280×720." },
    { kind: "studio", title: "Crea la miniatura", instructions: "Crea una comp **1280×720** llamada **Thumbnail** y añade **texto** grande (tamaño ≥ **120**) con **contorno** o **sombra** activado (panel Carácter).", goals: ["Comp **1280×720**", "Texto grande (≥ 120)", "Con contorno o sombra"] },
  ] },
  "brief": { title: "El brief", summary: "Entender qué quiere realmente el cliente.", steps: [
    { kind: "theory", title: "Las preguntas correctas", body: ["El **brief** es el documento (o conversación) donde el cliente explica qué quiere. Tu trabajo es hacer las preguntas correctas: el **objetivo** del vídeo, el **público**, **dónde** se publicará, **duración**, **estilo** (¡con ejemplos!), **fecha límite**, **presupuesto**.", "Un brief vago produce un vídeo equivocado y muchas revisiones."] },
    { kind: "quiz", question: "¿Qué pregunta NO es esencial en un brief?", options: ["Dónde se publicará el vídeo", "El público", "El color favorito de tu mascota", "La fecha límite"], explanation: "Las demás afectan formato, estilo y tiempos." },
    { kind: "theory", title: "Nuestro brief", body: ["**Cliente**: Pizzería de Squeak. **Objetivo**: atraer gente el sábado por la noche. **Dónde**: feed de Instagram (**4:5**, 1080×1350). **Duración**: 15–30 s. **Estilo**: cálido, rápido, apetecible. **Fecha límite**: viernes."] },
    { kind: "quiz", question: "El vídeo es para el feed de Instagram en 4:5. ¿Qué secuencia creas?", options: ["1080×1350", "1920×1080", "1080×1920", "1280×720"], explanation: "4:5 = 1080 de ancho por 1350 de alto." },
    { kind: "studio", title: "Configura el proyecto desde el brief", instructions: "Crea la secuencia para el brief: **1080×1350**, **30 fps**, llamada **Spot_Pizzeria**.", goals: ["Secuencia **1080×1350**", "A **30 fps** (o 29.97)", "Llamada **Spot_Pizzeria**"] },
  ] },
  "selezione": { title: "Selección de material", summary: "Elegir las mejores tomas.", steps: [
    { kind: "theory", title: "Ver todo, quedarse con poco", body: ["Antes de editar **ves todo** el metraje y eliges las mejores partes: enfocadas, bien expuestas, con la acción correcta. Normalmente se usa el **10–20%** de lo grabado.", "Pon lo seleccionado en una carpeta **Selección** y marca los buenos momentos con I/O o marcadores."] },
    { kind: "quiz", question: "¿Qué porcentaje del metraje suele acabar en el montaje?", options: ["10–20%", "100%", "90%", "1%"], explanation: "Se graba mucho para elegir lo mejor." },
    { kind: "theory", title: "Qué descartar", body: ["Desenfocado, tembloroso, sobreexpuesto, gente mirando a cámara por error, audio arruinado. Y tomas duplicadas: quédate solo con la mejor."] },
    { kind: "quiz", question: "¿Qué toma descartas primero?", options: ["La desenfocada", "La de mejor acción", "La bien expuesta", "El mejor detalle"], explanation: "El enfoque no se puede recuperar." },
    { kind: "studio", title: "La carpeta de selección", instructions: "Crea una carpeta **Selección** y pon los **3 mejores clips** para un spot de comida (sugerencia: café, ciudad y entrevista).", goals: ["Carpeta **Selección**", "Al menos **3 clips** dentro", "**Café** está ahí"] },
  ] },
  "assemblaggio": { title: "Ensamblaje", summary: "El primer montaje en bruto.", steps: [
    { kind: "theory", title: "El corte bruto", body: ["El **ensamblaje** (corte bruto) pone las selecciones en orden narrativo, **sin preocuparse por los detalles**. Es para ver si la estructura funciona.", "Es normal que sea demasiado largo: se acorta después."] },
    { kind: "quiz", question: "¿Para qué sirve el montaje en bruto?", options: ["Para verificar la estructura de la historia", "Para el etalonaje", "Para la exportación master", "Para la mezcla de audio"], explanation: "Primero la estructura, después los detalles." },
    { kind: "theory", title: "Estructura del spot", body: ["**Gancho** (imagen potente) → **problema/deseo** (sábado noche, hambre) → **solución** (la pizzería, la comida) → **llamada a la acción** (¡ven!)."] },
    { kind: "quiz", question: "¿Cuál es la última parte de un spot?", options: ["La llamada a la acción", "El gancho", "El problema", "Los títulos de apertura"], explanation: "Dile al espectador qué hacer: \"Reserva ahora\"." },
    { kind: "studio", title: "Ensambla el corte bruto", instructions: "Ensambla el spot: al menos **4 clips diferentes** en V1 sin huecos, **música** en A2 bajo todo el vídeo, duración total entre **15** y **30 s**.", goals: ["Al menos **4 clips diferentes** en V1", "Sin huecos", "Música bajo el vídeo", "Duración **15–30 s**"] },
  ] },
  "fine-cut": { title: "Del corte bruto al corte fino", summary: "Refinar ritmo e historia.", steps: [
    { kind: "theory", title: "Cortar, cortar, cortar", body: ["Del corte bruto al **corte fino** se trabaja principalmente **quitando**: cada plano debe durar solo lo necesario. Si una escena no aporta nada, fuera.", "Arregla los **cortes** (match cuts, J/L-cuts), cierra los **huecos**, comprueba el **ritmo**."] },
    { kind: "quiz", question: "¿Cuál es la actividad principal en la transición de bruto a fino?", options: ["Quitar lo innecesario", "Añadir efectos", "Alargar las escenas", "Cambiar el formato"], explanation: "El mejor montaje suele ser el más corto." },
    { kind: "theory", title: "Verlo como espectador", body: ["Revisa el montaje desde el principio sin parar, como lo haría un espectador. Donde te aburras, corta. Donde no entiendas, añade."] },
    { kind: "quiz", question: "Revisando el vídeo te aburres a la mitad. ¿Qué haces?", options: ["Acortar esa parte", "Añadir una transición de cubo", "Subir la música", "Nada"], explanation: "El aburrimiento es la señal para cortar." },
    { kind: "studio", title: "Refina el corte bruto", instructions: "Este corte bruto tiene huecos y planos demasiado largos. Conviértelo en corte fino: **sin huecos**, cada clip **≤ 4 s**, duración total **≤ 16 s**.", hint: "Recorta cada clip con la **herramienta Ripple (B)**: acorta y los huecos se cierran solos.", goals: ["Sin huecos", "Cada clip ≤ **4 s**", "Duración ≤ **16 s**"] },
  ] },
  "finalizzazione": { title: "Color, audio y exportación", summary: "Cerrar y entregar el proyecto.", steps: [
    { kind: "theory", title: "La última milla", body: ["La **finalización**: corrección de color y look (**consistente** en todos los clips), mezcla de audio (voz clara, música por debajo, sin picos por encima de **−1 dB**), títulos revisados y **exportación** en el formato del brief.", "Antes de entregar: revisa **todo** una vez, con auriculares."] },
    { kind: "quiz", question: "Antes de entregar, ¿qué haces siempre?", options: ["Revisar todo con auriculares", "Nada, entregar directamente", "Borrar el proyecto", "Cambiar el formato"], explanation: "La revisión final salva de errores vergonzosos." },
    { kind: "theory", title: "El paquete de entrega", body: ["Al cliente: el archivo **final** (H.264 para redes), posiblemente un **master** de alta calidad y, si se acordó, versiones en varios formatos (9:16, 1:1)."] },
    { kind: "quiz", question: "¿Qué contiene una entrega típica al cliente?", options: ["El archivo final más las versiones y master eventuales", "Solo el proyecto de Premiere", "El metraje crudo", "Nada"], explanation: "Lo que se acordó en el presupuesto." },
    { kind: "studio", title: "Color y audio", instructions: "Últimos retoques: aplica **Lumetri Color** a al menos **2 clips** (con **Contraste** ≥ **+10**) y lleva la **música** entre **−22** y **−14 dB**.", goals: ["Lumetri en **2+ clips** (contraste ≥ +10)", "Música **−22…−14 dB**"] },
    { kind: "studio", title: "¡Entrega!", instructions: "Exporta el spot terminado para el feed: **H.264**, **1080×1350**, bitrate entre **8** y **20 Mbps**. ¡Felicidades: has terminado el curso!", goals: ["**H.264**", "**1080×1350**", "Bitrate **8–20 Mbps**"] },
    { kind: "match", title: "Empareja", pairs: [["Brief", "Lo que quiere el cliente"], ["Corte bruto", "Primera estructura"], ["Corte fino", "Ritmo refinado"], ["Entrega", "Archivos finales al cliente"]] },
  ] },
};

export default es;
