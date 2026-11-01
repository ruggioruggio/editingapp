import type { LessonTranslations } from "./types";

const fr: LessonTranslations = {
  "primo-taglio": {
    title: "Le premier montage",
    summary: "Importer, couper et exporter en 5 minutes.",
    steps: [
      { kind: "theory", title: "Que fait un monteur ?", body: [
        "Un monteur vidéo prend les **rushes** (les fichiers tournés) et les transforme en une **histoire** : il choisit les meilleurs moments, les arrange dans un ordre logique, ajoute de la musique et des titres.",
        "Le résultat est une **séquence** (ou timeline) qui se lit du début à la fin, exactement comme le spectateur la verra.",
      ] },
      { kind: "quiz", question: "Quel est l'objectif principal du montage ?", options: ["Rendre les couleurs plus vives", "Transformer les rushes en une histoire cohérente", "Enregistrer de l'audio", "Ajouter de la 3D"], explanation: "Un bon montage, c'est d'abord du storytelling : choisir quoi montrer, dans quel ordre et pendant combien de temps." },
      { kind: "theory", title: "L'espace de travail", body: [
        "Chaque logiciel de montage a les mêmes zones : le **Project** (tes fichiers), le **Source Monitor** (prévisualiser avant d'utiliser), la **Timeline** (l'endroit où tu montes) et le **Program Monitor** (ce que le spectateur verra).",
      ] },
      { kind: "quiz", question: "Où s'effectue le montage proprement dit ?", options: ["Dans le Project", "Dans la Timeline", "Dans le Source Monitor", "Dans la corbeille"], explanation: "La Timeline est la zone de travail : c'est là que tu arranges tes clips dans l'ordre." },
      { kind: "editor", title: "Coupe le clip en deux", instructions: "Place le curseur au milieu du clip et appuie sur le bouton **Couper** (ou **C** au clavier). Tu devrais obtenir **2 morceaux** séparés." },
      { kind: "editor", title: "Supprime le deuxième morceau", instructions: "Sélectionne le **deuxième** morceau et appuie sur **Supprimer** pour le retirer de la timeline." },
      { kind: "editor", title: "Exporte ton premier montage", instructions: "Appuie sur **Exporter** et choisis **H.264**. Félicitations, tu as fait ton premier montage !" },
    ],
  },
  "crea-sequenza": {
    title: "Créer une séquence",
    summary: "Résolution, fréquence d'images et réglages de la timeline.",
    steps: [
      { kind: "theory", title: "Qu'est-ce qu'une séquence ?", body: [
        "Une **séquence** (ou timeline) est le conteneur de ton montage : elle a une **résolution** (ex. 1920×1080), une **fréquence d'images** (ex. 25 fps) et des pistes audio/vidéo.",
        "Si les réglages de la séquence ne correspondent pas à ceux des fichiers, tu auras des barres noires ou des sauts d'image. La règle d'or : **la séquence doit correspondre à tes fichiers source**.",
      ] },
      { kind: "quiz", question: "Que se passe-t-il si la séquence est en 1080p et le fichier en 4K ?", options: ["Le fichier est redimensionné (tu perds en détail ou tu dois repositionner)", "Rien, c'est pareil", "L'audio disparaît", "Le logiciel plante"], explanation: "Des réglages différents = des conversions que tu devras gérer toi-même." },
      { kind: "match", title: "Associe", pairs: [["1920×1080", "Full HD"], ["3840×2160", "4K UHD"], ["25 fps", "Standard PAL"], ["29.97 fps", "Standard NTSC"]] },
      { kind: "studio", title: "Crée la séquence", instructions: "Crée une nouvelle séquence **1920×1080** à **25 fps** (ou 29.97). Vérifie les réglages dans Séquence → Réglages." },
    ],
  },
  "importare": {
    title: "Importer des médias",
    summary: "Apporter des fichiers dans le projet et les garder organisés.",
    steps: [
      { kind: "theory", title: "Ne jamais déplacer les originaux", body: [
        "Quand tu importes un fichier, le logiciel ne le copie **pas** : il crée un **lien** vers l'original. Si tu déplaces ou renommes le fichier sur le disque, le lien se casse et tu verras **Média hors ligne**.",
        "Règle d'or : copie tout dans un **dossier projet** *avant* d'importer, et ne touche plus à rien.",
      ] },
      { kind: "quiz", question: "Tu as renommé un fichier vidéo sur le bureau après l'avoir importé. Que se passe-t-il ?", options: ["Rien", "Le projet affiche « Média hors ligne »", "Le fichier est supprimé", "La qualité diminue"], explanation: "Le logiciel cherche le chemin d'origine : s'il ne le trouve pas, le média est hors ligne." },
      { kind: "theory", title: "Ranger les chutiers", body: [
        "Crée des **chutiers** (dossiers) dans le panneau Projet : Vidéo, Audio, Images, Séquences. Tu retrouveras tout même 6 mois plus tard.",
      ] },
      { kind: "quiz", question: "Pourquoi créer des chutiers dans le projet ?", options: ["Pour que le logiciel aille plus vite", "Pour retrouver les fichiers facilement", "Ce n'est pas nécessaire", "Pour améliorer la qualité vidéo"], explanation: "L'organisation te fait gagner du temps à chaque ouverture du projet." },
      { kind: "studio", title: "Importer et organiser", instructions: "Importe les fichiers dans le projet et range-les dans au moins **2 chutiers** nommés (ex. « Vidéo » et « Audio »)." },
    ],
  },
  "monitor": {
    title: "Source et Programme",
    summary: "Prévisualiser, choisir les morceaux et vérifier le résultat final.",
    steps: [
      { kind: "theory", title: "Deux écrans, deux fonctions", body: [
        "Le **Source Monitor** te montre le clip *avant* de le placer dans la timeline : tu peux choisir le morceau exact. Le **Program Monitor** te montre le résultat final de la séquence.",
        "Un double-clic sur un clip dans le Project l'ouvre dans le Source ; ce qui est dans la Timeline se voit dans le Program.",
      ] },
      { kind: "quiz", question: "Tu veux prévisualiser un clip avant de le monter. Où le regardes-tu ?", options: ["Program Monitor", "Source Monitor", "Directement dans la Timeline", "Dans le dossier"], explanation: "Le Source est fait pour ça : regarder et choisir avant de couper." },
      { kind: "theory", title: "Raccourcis essentiels", body: [
        "**J K L** : lecture arrière, pause, lecture avant. Appuie deux fois sur L pour accélérer. Ces trois touches sont la base du flux de travail dans tout logiciel de montage.",
      ] },
      { kind: "quiz", question: "Que fait la touche L appuyée deux fois ?", options: ["Avance rapide (2×)", "Pause", "Ferme le projet", "Enregistre"], explanation: "Chaque pression supplémentaire double la vitesse de lecture." },
      { kind: "studio", title: "Navigue dans le clip", instructions: "Ouvre un clip dans le Source Monitor et utilise **J K L** pour le parcourir." },
    ],
  },
  "in-out": {
    title: "Points d'entrée et de sortie",
    summary: "Choisir la portion parfaite d'un clip.",
    steps: [
      { kind: "theory", title: "Entrée et Sortie", body: [
        "Le point d'**Entrée** (**I**) marque le début de la portion qui t'intéresse ; le point de **Sortie** (**O**) marque la fin. Seule la partie entre les deux sera insérée dans la timeline.",
        "C'est plus rapide et plus précis que de tout glisser dans la timeline et de couper ensuite.",
      ] },
      { kind: "quiz", question: "Tu veux utiliser seulement les secondes 5 à 10 d'un clip. Que fais-tu ?", options: ["Entrée à 5 s, Sortie à 10 s, puis insérer", "Tout glisser et supprimer le reste", "Exporter uniquement ces secondes", "Dupliquer le clip"], explanation: "I/O te donne exactement ce que tu veux en un instant." },
      { kind: "theory", title: "Modifier un point", body: [
        "Tu peux déplacer les points d'Entrée et de Sortie autant que tu veux avant d'insérer. Appuie à nouveau sur **I** ou **O** pour les repositionner.",
      ] },
      { kind: "quiz", question: "Tu as placé l'Entrée trop tôt. Que fais-tu ?", options: ["Avancer et appuyer à nouveau sur I", "Tout recommencer", "Supprimer le clip", "Exporter tel quel"], explanation: "Les points sont repositionnables à l'infini." },
      { kind: "studio", title: "Choisis la meilleure prise", instructions: "Ouvre le clip dans le Source, place **I** et **O** pour isoler un moment (2 à 5 secondes), puis **insère**-le dans la timeline." },
    ],
  },
  "inserisci-sovrascrivi": {
    title: "Insérer et écraser",
    summary: "Deux façons de placer un clip dans la timeline.",
    steps: [
      { kind: "theory", title: "Insérer vs Écraser", body: [
        "**Insérer** (**,**) pousse les clips existants pour faire de la place au nouveau. **Écraser** (**.**) remplace ce qu'il y a sous le curseur, sans déplacer le reste.",
        "Insert quand tu veux ajouter entre deux clips ; Overwrite quand tu veux remplacer un passage.",
      ] },
      { kind: "quiz", question: "Tu veux remplacer un mauvais plan sans décaler la timeline. Quelle commande ?", options: ["Insérer", "Écraser", "Supprimer", "Copier-coller"], explanation: "Écraser remplace pile à l'endroit du curseur." },
      { kind: "theory", title: "Quel risque avec Écraser ?", body: [
        "Écraser **efface** le contenu sous le curseur. Si le curseur est au mauvais endroit, tu perds un morceau. Toujours vérifier la position du curseur avant d'écraser.",
      ] },
      { kind: "quiz", question: "Tu as accidentellement écrasé un bon clip. Que fais-tu en premier ?", options: ["Ctrl+Z (Annuler)", "Exporter quand même", "Fermer sans enregistrer", "Recommencer le projet"], explanation: "Annuler est ton meilleur ami : il remet tout comme avant." },
      { kind: "studio", title: "Insérer puis écraser", instructions: "**Insère** un clip entre deux clips existants (la timeline doit s'allonger), puis **écrase** un passage de 2 secondes avec un autre clip." },
    ],
  },
  "trim": {
    title: "Le trim",
    summary: "Ajuster la coupe image par image.",
    steps: [
      { kind: "theory", title: "Couper et peaufiner", body: [
        "Le **trim** ajuste un point de coupe image par image. Place le curseur sur le bord d'un clip et fais-le glisser : tu rallonges ou raccourcis ce clip.",
        "Un bon monteur fait une première coupe rapide, puis peaufine chaque raccord au trim.",
      ] },
      { kind: "quiz", question: "Tu veux qu'un clip finisse 10 images plus tôt. Que fais-tu ?", options: ["Trim du bord droit vers la gauche", "Supprimer le clip", "Rajouter un fondu", "Changer le fps"], explanation: "Le trim est la façon précise de raccourcir ou rallonger un clip." },
      { kind: "theory", title: "Trim au clavier", body: [
        "Place le curseur sur la coupe et utilise les **crochets** **[** et **]** (ou les touches désignées) pour reculer ou avancer d'une image. Plus rapide et plus précis qu'à la souris.",
      ] },
      { kind: "quiz", question: "Pourquoi utiliser le trim au clavier plutôt qu'à la souris ?", options: ["Plus précis et plus rapide", "Pour couper l'audio", "C'est obligatoire", "Pour changer de format"], explanation: "Le clavier permet un contrôle image par image sans approximation." },
      { kind: "studio", title: "Peaufine la coupe", instructions: "Déplace le bord d'un clip pour qu'il commence ou finisse au bon moment, à l'image près." },
    ],
  },
  "ripple-roll": {
    title: "Ripple et Roll",
    summary: "Deux trims qui fonctionnent différemment.",
    steps: [
      { kind: "theory", title: "Ripple : la timeline suit", body: [
        "Le **Ripple trim** raccourcit ou rallonge un clip et **décale tout ce qui suit**. Pas de trou, pas de désynchronisation : c'est le trim le plus utilisé.",
      ] },
      { kind: "quiz", question: "Tu fais un Ripple trim pour raccourcir un clip. Que se passe-t-il ?", options: ["Tout ce qui suit se décale", "Un trou apparaît", "L'audio disparaît", "La séquence s'allonge"], explanation: "Ripple « referme » automatiquement l'espace." },
      { kind: "theory", title: "Roll : le point de coupe glisse", body: [
        "Le **Roll trim** déplace le point de coupe entre deux clips : un s'allonge, l'autre se raccourcit. La durée totale ne change pas.",
      ] },
      { kind: "quiz", question: "Avec un Roll trim, la durée totale de la séquence…", options: ["Diminue", "Reste la même", "Double", "Dépend du clip"], explanation: "Roll ne fait que déplacer la coupe : un clip gagne ce que l'autre perd." },
      { kind: "studio", title: "Ripple puis Roll", instructions: "Fais un **Ripple** trim sur un clip (raccourcis-le et vérifie que la timeline se referme), puis un **Roll** trim entre deux clips." },
    ],
  },
  "slip-slide": {
    title: "Slip et Slide",
    summary: "Changer le contenu ou la position sans toucher au reste.",
    steps: [
      { kind: "theory", title: "Slip : nouveau contenu, même durée", body: [
        "Le **Slip** change le contenu visible d'un clip (les points d'Entrée/Sortie bougent) sans modifier sa durée ni sa position dans la timeline. Utile pour recaler un plan sans toucher au montage.",
      ] },
      { kind: "quiz", question: "Tu veux montrer un moment plus tard dans le clip sans changer la durée. Quel outil ?", options: ["Slip", "Slide", "Ripple", "Razor"], explanation: "Le Slip fait défiler le contenu à l'intérieur du clip." },
      { kind: "theory", title: "Slide : nouvelle position, même contenu", body: [
        "Le **Slide** déplace le clip dans la timeline (les voisins se rallongent/raccourcissent) sans changer le contenu du clip déplacé.",
      ] },
      { kind: "quiz", question: "Tu veux que le clip arrive 1 seconde plus tôt dans la timeline, mais sans changer ce qu'il montre. Quel outil ?", options: ["Slip", "Slide", "Roll", "Razor"], explanation: "Le Slide déplace le clip et ajuste les voisins." },
      { kind: "studio", title: "Teste les deux", instructions: "Fais un **Slip** sur un clip (le contenu change mais la durée reste) puis un **Slide** sur un autre (la position change mais le contenu reste)." },
    ],
  },
  "snapping-marker": {
    title: "Snapping et marqueurs",
    summary: "S'accrocher à la grille et marquer les moments clés.",
    steps: [
      { kind: "theory", title: "Le snapping magnétique", body: [
        "Le **snapping** (aimantation, **S** pour activer/désactiver) fait s'accrocher les clips les uns aux autres : pas de micro-trou, pas de superposition involontaire. Laisse-le activé 90 % du temps.",
      ] },
      { kind: "quiz", question: "Tu déplaces un clip et il « saute » contre un autre. Pourquoi ?", options: ["Le snapping est activé", "Le clip est verrouillé", "Le curseur est bloqué", "C'est un bug"], explanation: "C'est le snapping : il t'aide à aligner les clips." },
      { kind: "theory", title: "Les marqueurs", body: [
        "Un **marqueur** (**M**) est une marque de repère sur la timeline ou un clip. Utilise-les pour noter les beats de la musique, les moments importants, les notes client.",
      ] },
      { kind: "quiz", question: "Quel raccourci pose un marqueur ?", options: ["M", "C", "V", "B"], explanation: "M comme Marqueur." },
      { kind: "studio", title: "Marqueur sur le beat", instructions: "Écoute la musique et pose un **marqueur** (**M**) sur chaque beat principal (au moins 4)." },
    ],
  },
  "scorciatoie": {
    title: "Raccourcis indispensables",
    summary: "Les touches qui accélèrent tout.",
    steps: [
      { kind: "theory", title: "Les indispensables", body: [
        "**C** (Razor/lame) coupe le clip sous le curseur. **V** sélectionne le clip. **Ctrl+Z** annule. **Barre d'espace** lecture/pause. **I/O** Entrée/Sortie. **J K L** navigation.",
        "Apprendre ces raccourcis, c'est la différence entre des heures et des minutes.",
      ] },
      { kind: "quiz", question: "Tu veux couper un clip sous le curseur. Quel raccourci ?", options: ["C", "V", "M", "B"], explanation: "C comme Cut (Couper) : la lame de rasoir." },
      { kind: "match", title: "Associe", pairs: [["C", "Couper (Razor)"], ["V", "Sélection"], ["I / O", "Entrée / Sortie"], ["M", "Marqueur"]] },
      { kind: "studio", title: "Montage rapide", instructions: "Monte une séquence de **3 coupes** en utilisant uniquement **C** pour couper et **Suppr** pour effacer. N'utilise pas la souris pour couper." },
    ],
  },
  "livelli-db": {
    title: "Niveaux et décibels",
    summary: "Comprendre le volume dans la timeline.",
    steps: [
      { kind: "theory", title: "Qu'est-ce qu'un décibel ?", body: [
        "Le **dB** (décibel) mesure le volume. Dans le montage vidéo, **0 dB** est le maximum : au-delà, l'audio **sature** (grésille). Le dialogue se situe généralement entre **−12** et **−6 dB**, la musique entre **−20** et **−12 dB**.",
      ] },
      { kind: "quiz", question: "Ton VU-mètre passe dans le rouge. Que se passe-t-il ?", options: ["L'audio sature", "Le volume est trop bas", "La vidéo est corrompue", "C'est normal"], explanation: "Le rouge signifie au-dessus de 0 dB : distorsion." },
      { kind: "theory", title: "La ligne de niveau", body: [
        "Dans la timeline, chaque clip audio a une **ligne horizontale** : fais-la glisser vers le haut pour augmenter le volume, vers le bas pour le baisser. C'est le moyen le plus direct d'ajuster le mix.",
      ] },
      { kind: "quiz", question: "Tu veux baisser le volume d'un clip directement dans la timeline. Que fais-tu ?", options: ["Glisser la ligne de niveau vers le bas", "Supprimer la piste audio", "Changer la résolution vidéo", "Ajouter une transition"], explanation: "La ligne de niveau est la commande de volume la plus directe." },
      { kind: "studio", title: "Équilibre le mix", instructions: "Règle la **musique** entre **−20** et **−14 dB** et la **voix** entre **−12** et **−6 dB** à l'aide de la ligne de niveau dans la timeline." },
    ],
  },
  "keyframe-volume": {
    title: "Keyframes de volume",
    summary: "Faire varier le volume au fil du temps.",
    steps: [
      { kind: "theory", title: "Qu'est-ce qu'un keyframe audio ?", body: [
        "Un **keyframe** est un point de contrôle sur la ligne de niveau : entre deux keyframes, le volume monte ou descend progressivement. C'est comme ça que tu fais un **fondu** ou que tu baisses la musique quand quelqu'un parle.",
      ] },
      { kind: "quiz", question: "La musique doit baisser quand la voix commence. Comment faire ?", options: ["Deux keyframes : un à volume normal, un à volume bas", "Couper la musique", "Mettre la musique en muet", "Exporter sans musique"], explanation: "Les keyframes créent une rampe automatique." },
      { kind: "theory", title: "Placer et déplacer les keyframes", body: [
        "**Ctrl+clic** (ou le bouton dédié) sur la ligne de niveau ajoute un keyframe. Glisse-le pour changer le moment ou le volume. Pour une rampe rapide, rapproche les keyframes ; pour une rampe lente, éloigne-les.",
      ] },
      { kind: "quiz", question: "Tu veux un fondu de sortie très lent. Comment places-tu les keyframes ?", options: ["Éloignés l'un de l'autre", "Rapprochés", "Un seul suffit", "Dans un autre clip"], explanation: "Plus l'espace est grand, plus la transition est douce." },
      { kind: "studio", title: "Fondu de sortie musical", instructions: "Crée un **fondu de sortie** sur la musique : place **2 keyframes** et fais descendre le volume de **−14** à **−∞ dB** (silence) sur les dernières secondes." },
    ],
  },
  "ducking": {
    title: "Le ducking",
    summary: "La musique baisse automatiquement quand quelqu'un parle.",
    steps: [
      { kind: "theory", title: "La musique laisse passer la voix", body: [
        "Le **ducking** baisse automatiquement le volume de la musique quand il y a de la voix, et le remonte quand la voix s'arrête. C'est la technique la plus utilisée dans les podcasts, les tutos et les vlogs.",
      ] },
      { kind: "quiz", question: "Dans un vlog, pendant que la personne parle, la musique devrait être…", options: ["Plus forte", "Plus basse", "Coupée", "Identique"], explanation: "La musique doit soutenir, pas couvrir." },
      { kind: "theory", title: "Le faire à la main", body: [
        "4 keyframes suffisent : **volume normal → descente → volume bas (pendant la parole) → remontée → volume normal**. Espace les keyframes de descente/remontée de 10 à 20 images pour un résultat naturel.",
      ] },
      { kind: "quiz", question: "Combien de keyframes faut-il au minimum pour un ducking ?", options: ["2", "4", "1", "10"], explanation: "Normal → bas → bas → normal : 4 points au minimum." },
      { kind: "studio", title: "Duck la musique", instructions: "La musique joue pendant la voix. Crée **4 keyframes** pour la baisser sous la parole (entre **−24** et **−18 dB**) et la remonter après." },
    ],
  },
  "rumore": {
    title: "La réduction de bruit",
    summary: "Éliminer les bruits de fond.",
    steps: [
      { kind: "theory", title: "Le bruit dans l'audio", body: [
        "Le **bruit** est tout ce qu'on ne veut pas entendre : ventilateur, climatisation, souffle du micro, bourdonnement électrique. Il nuit à la voix et donne une impression d'amateur.",
      ] },
      { kind: "quiz", question: "Qu'est-ce que le « bruit de fond » en audio ?", options: ["La musique", "Les sons indésirables (ventilateur, souffle…)", "Le dialogue", "L'écho"], explanation: "C'est tout ce qui n'est pas le signal utile." },
      { kind: "theory", title: "Réduire le bruit", body: [
        "Les filtres de **réduction de bruit** (DeNoise, RX) analysent un profil de bruit (un passage silencieux) et le soustraient du signal. Attention : trop fort et la voix sonne « sous l'eau ».",
      ] },
      { kind: "quiz", question: "Que se passe-t-il si tu abuses de la réduction de bruit ?", options: ["L'audio sature", "La voix sonne métallique ou « sous l'eau »", "Le bruit disparaît complètement sans effet secondaire", "La vidéo ralentit"], explanation: "Trop de réduction = artefacts audibles." },
      { kind: "studio", title: "Nettoie l'interview", instructions: "Applique un filtre de réduction de bruit au clip d'interview. Réduis le **bruit** d'au moins **6 dB** sans dégrader la voix." },
    ],
  },
  "sfx": {
    title: "Les effets sonores",
    summary: "Ajouter du poids et de l'émotion avec les SFX.",
    steps: [
      { kind: "theory", title: "Le son raconte aussi", body: [
        "Un **effet sonore** (SFX) renforce ce qu'on voit : un *whoosh* lors d'une transition rapide, un *impact* sur un titre, un *ambiance* pour plonger le spectateur dans une scène.",
        "La règle : **si tu le remarques, c'est trop fort**. Un bon SFX est ressenti, pas remarqué.",
      ] },
      { kind: "quiz", question: "Un *whoosh* sur une transition doit être…", options: ["Le plus fort possible", "Subtil : ressenti mais pas remarqué", "En silence", "Uniquement en stéréo"], explanation: "Le son soutient la transition, il ne doit pas la dominer." },
      { kind: "theory", title: "Calage et volume", body: [
        "Le SFX doit être calé au **frame** près : un impact en avance ou en retard « casse » l'effet. Le volume dépend du contexte : seul il peut être à −10 dB, sous la parole il descend à −20 ou moins.",
      ] },
      { kind: "quiz", question: "L'impact sonore arrive 0,5 s après le titre. Que fais-tu ?", options: ["Tu le décales pour qu'il tombe pile sur l'apparition", "Tu laisses tel quel", "Tu le supprimes", "Tu baisses le volume"], explanation: "Le timing est crucial : le SFX doit coïncider avec l'image." },
      { kind: "studio", title: "Ajoute un SFX", instructions: "Place un **effet sonore** (whoosh ou impact) exactement sur une transition ou une apparition de titre, avec un volume entre **−18** et **−8 dB**." },
    ],
  },
  "taglio-netto": {
    title: "La coupe franche",
    summary: "La transition la plus utilisée en montage.",
    steps: [
      { kind: "theory", title: "Pas de transition, et c'est parfait", body: [
        "La **coupe franche** (hard cut) est le passage direct d'un plan à un autre, sans effet. C'est la transition la plus utilisée au cinéma et dans les vidéos pro.",
        "Si les deux plans sont bien choisis (changement d'angle, d'échelle ou de sujet), la coupe est invisible et naturelle.",
      ] },
      { kind: "quiz", question: "Quand est-ce qu'une coupe franche fonctionne le mieux ?", options: ["Quand il y a un changement d'angle ou de sujet", "Uniquement entre clips identiques", "Jamais, il faut toujours une transition", "Seulement sur la musique"], explanation: "Un bon changement de plan se suffit à lui-même." },
      { kind: "theory", title: "Quand ne PAS faire une coupe franche", body: [
        "Évite la coupe franche entre deux plans **quasi identiques** (même angle, même sujet) : le spectateur voit un saut. C'est le fameux **jump cut**.",
      ] },
      { kind: "quiz", question: "Deux plans presque identiques avec une coupe franche produisent…", options: ["Un jump cut (saut visuel)", "Un fondu enchaîné", "Un effet de ralenti", "Un zoom"], explanation: "Le saut est gênant : change d'angle ou utilise une transition." },
      { kind: "studio", title: "Trois plans, deux coupes franches", instructions: "Monte **3 plans différents** avec des coupes franches. Chaque plan doit montrer un **angle ou un sujet différent**." },
    ],
  },
  "dissolvenza": {
    title: "Le fondu enchaîné",
    summary: "La transition classique du cinéma.",
    steps: [
      { kind: "theory", title: "Un plan fond dans l'autre", body: [
        "Le **fondu enchaîné** (cross dissolve) fait disparaître progressivement un plan pendant que le suivant apparaît. Il indique souvent un **passage de temps** ou un **changement de lieu**.",
        "Il dure généralement **15 à 30 images** (0,5 à 1 seconde).",
      ] },
      { kind: "quiz", question: "Tu veux montrer que des heures se sont écoulées entre deux plans. Quelle transition ?", options: ["Coupe franche", "Fondu enchaîné", "Volet (wipe)", "Zoom"], explanation: "Le fondu enchaîné est la transition « passage du temps » par excellence." },
      { kind: "theory", title: "Les poignées (handles)", body: [
        "Un fondu a besoin de **poignées** : des images supplémentaires de chaque côté de la coupe. Si le clip est coupé pile, il n'y a pas de matière pour fondre. Laisse toujours un peu de marge au trim.",
      ] },
      { kind: "quiz", question: "Tu appliques un fondu enchaîné mais il ne fonctionne pas. Cause probable ?", options: ["Pas assez de poignées (images restantes)", "Le fichier est en 4K", "L'audio est trop fort", "Il faut deux écrans"], explanation: "Sans poignées, pas de fondu possible." },
      { kind: "studio", title: "Ajoute un fondu", instructions: "Applique un **fondu enchaîné** entre deux clips, d'une durée comprise entre **15** et **30 images** (0,5–1 s)." },
    ],
  },
  "dissolvenza-nero": {
    title: "Fondu au noir",
    summary: "Ouvrir et fermer avec classe.",
    steps: [
      { kind: "theory", title: "Noir → image → noir", body: [
        "Le **fondu au noir** (Dip to Black) est la transition d'ouverture et de fermeture classique : la vidéo émerge du noir au début et y retourne à la fin.",
        "Une ouverture de **1 à 2 secondes** et une fermeture similaire donnent un aspect « cinéma ».",
      ] },
      { kind: "quiz", question: "Tu veux une fin qui « se ferme » doucement. Quelle transition ?", options: ["Fondu au noir", "Coupe franche", "Fondu enchaîné", "Zoom arrière"], explanation: "Le fondu au noir est la conclusion classique." },
      { kind: "theory", title: "À n'utiliser que pour l'ouverture et la fermeture", body: [
        "Un fondu au noir *au milieu* du montage ralentit le rythme et donne l'impression que la vidéo est finie. Garde-le pour le début et la fin.",
      ] },
      { kind: "quiz", question: "Un fondu au noir à chaque changement de scène est-il une bonne idée ?", options: ["Non, ça ralentit et ça lasse", "Oui, c'est professionnel", "Seulement en 4K", "Seulement avec de la musique"], explanation: "Réserve-le aux moments importants." },
      { kind: "studio", title: "Ouvre et ferme avec un fondu au noir", instructions: "Ajoute un **fondu au noir** en ouverture (au début de la séquence) et un en fermeture (à la fin), chacun de **1 à 2 secondes**." },
    ],
  },
  "j-l-cut": {
    title: "Le J-cut et le L-cut",
    summary: "Quand le son et l'image ne coupent pas en même temps.",
    steps: [
      { kind: "theory", title: "Audio en avance ou en retard", body: [
        "Dans un **J-cut**, tu entends l'audio du plan suivant *avant* de le voir (la coupe audio ressemble à un J). Dans un **L-cut**, l'audio du plan précédent continue *après* le changement d'image (forme de L).",
        "Ce sont les transitions les plus naturelles : dans la vraie vie, on entend souvent quelque chose avant de le voir.",
      ] },
      { kind: "quiz", question: "Tu entends une voiture avant de la voir à l'image. C'est un…", options: ["J-cut", "L-cut", "Jump cut", "Match cut"], explanation: "L'audio arrive en avance : c'est la forme en J." },
      { kind: "theory", title: "Comment le faire", body: [
        "Sépare l'audio et la vidéo (ou utilise le trim audio/vidéo indépendant), puis décale l'audio de quelques images avant ou après la coupe vidéo.",
      ] },
      { kind: "quiz", question: "Un montage qui coupe toujours audio et vidéo en même temps semble…", options: ["Plus naturel", "Rigide et saccadé", "Plus rapide", "Plus coloré"], explanation: "Des coupes audio/vidéo désynchronisées = fluidité naturelle." },
      { kind: "studio", title: "Crée un J-cut", instructions: "Fais commencer l'**audio** du deuxième clip **avant** la coupe vidéo (au moins **10 images** d'avance)." },
    ],
  },
  "no-transizioni": {
    title: "Erreurs de transitions",
    summary: "Pourquoi trop de transitions gâchent le montage.",
    steps: [
      { kind: "theory", title: "Moins c'est mieux", body: [
        "Les débutants abusent des transitions fantaisistes (étoile, spirale, cube 3D). Résultat : le montage a l'air d'un clip des années 90.",
        "Les pros utilisent principalement **la coupe franche** et le **fondu enchaîné**. Chaque transition doit avoir une **raison narrative**.",
      ] },
      { kind: "quiz", question: "Une transition en étoile est…", options: ["Spectaculaire et professionnelle", "À éviter dans 99 % des cas", "Obligatoire entre chaque scène", "La meilleure pour YouTube"], explanation: "Les transitions fantaisistes distraient du contenu." },
      { kind: "theory", title: "Quand utiliser une transition", body: [
        "Un fondu enchaîné pour un **passage de temps**. Un dip to black pour un **changement majeur**. Un *whip pan* pour de l'**énergie**. C'est tout.",
      ] },
      { kind: "quiz", question: "Tu veux une transition énergique entre deux plans d'action. Laquelle ?", options: ["Whip pan (mouvement rapide)", "Fondu enchaîné", "Spiral", "Fondu au noir"], explanation: "Le whip pan donne de l'énergie sans avoir l'air « fait par le logiciel »." },
      { kind: "studio", title: "Monte sans transitions", instructions: "Monte **4 plans** en utilisant uniquement des **coupes franches**. Le rythme doit fonctionner **sans aucune transition**." },
    ],
  },
  "keyframe": {
    title: "Les keyframes vidéo",
    summary: "Animer n'importe quelle propriété au fil du temps.",
    steps: [
      { kind: "theory", title: "Deux points, une animation", body: [
        "Un **keyframe** est une valeur à un instant précis. Avec deux keyframes (ex. échelle 100 % à la seconde 0, 150 % à la seconde 2), le logiciel calcule les valeurs intermédiaires : le résultat est un **mouvement fluide**.",
      ] },
      { kind: "quiz", question: "Il te faut au minimum combien de keyframes pour créer un mouvement ?", options: ["1", "2", "5", "10"], explanation: "Un point de départ et un point d'arrivée : le logiciel interpole le reste." },
      { kind: "theory", title: "Quelles propriétés animer ?", body: [
        "**Position** (déplacer), **Échelle** (zoomer/dézoomer), **Rotation** (tourner), **Opacité** (apparaître/disparaître). Ce sont les 4 propriétés de base de l'animation vidéo.",
      ] },
      { kind: "quiz", question: "Tu veux qu'une image apparaisse progressivement. Quelle propriété ?", options: ["Opacité (de 0 % à 100 %)", "Position", "Rotation", "Échelle"], explanation: "L'opacité contrôle la transparence." },
      { kind: "studio", title: "Anime l'échelle", instructions: "Crée un **zoom progressif** : place deux keyframes d'**Échelle**, de **100 %** à au moins **120 %**, sur 2 à 4 secondes." },
    ],
  },
  "posizione-scala": {
    title: "Position et échelle",
    summary: "Déplacer et redimensionner l'image.",
    steps: [
      { kind: "theory", title: "Coordonnées X et Y", body: [
        "La **Position** est en coordonnées (X, Y) : X est horizontal, Y est vertical. En 1920×1080, le **centre** est (960, 540).",
        "L'**Échelle** est en pourcentage : 100 % = taille originale. 200 % = double, 50 % = moitié.",
      ] },
      { kind: "quiz", question: "En 1920×1080, quelles coordonnées centrent l'image ?", options: ["960, 540", "0, 0", "1920, 1080", "500, 500"], explanation: "Le centre est toujours la moitié de la résolution." },
      { kind: "theory", title: "Le Ken Burns", body: [
        "Le **Ken Burns** est un lent zoom (ou pan) sur une photo ou un plan fixe. Deux keyframes de Position/Échelle suffisent : le plan devient vivant.",
      ] },
      { kind: "quiz", question: "Comment créer un effet Ken Burns ?", options: ["Keyframes de Position et/ou Échelle", "Une transition spéciale", "Un effet audio", "Un format différent"], explanation: "Un mouvement lent et continu : c'est tout ce qu'il faut." },
      { kind: "studio", title: "Ken Burns sur une photo", instructions: "Fais un **zoom lent** sur l'image : de **100 %** à au moins **115 %** sur toute la durée du clip, avec deux keyframes d'Échelle." },
    ],
  },
  "rotazione-opacita": {
    title: "Rotation et opacité",
    summary: "Tourner et faire apparaître/disparaître.",
    steps: [
      { kind: "theory", title: "Rotation", body: [
        "La **Rotation** se mesure en degrés : 0° est la position normale, 90° est un quart de tour, 360° est un tour complet. Pour des rotations continues, anime au-delà de 360 (ex. 0° → 720° = 2 tours).",
      ] },
      { kind: "quiz", question: "Tu veux qu'un logo fasse 2 tours complets. Quelle valeur finale ?", options: ["360°", "720°", "90°", "180°"], explanation: "360 × 2 = 720°." },
      { kind: "theory", title: "Opacité", body: [
        "L'**Opacité** va de **0 %** (invisible) à **100 %** (complètement visible). Animer l'opacité crée des **fondus** : c'est comme ça qu'un titre apparaît et disparaît en douceur.",
      ] },
      { kind: "quiz", question: "Opacité 0 % signifie…", options: ["Complètement invisible", "Complètement visible", "Demi-transparent", "Noir"], explanation: "0 % = transparent, 100 % = opaque." },
      { kind: "studio", title: "Titre qui apparaît et tourne", instructions: "Fais apparaître un titre avec un **fondu** (Opacité de **0 %** à **100 %**) et ajoute une **rotation** d'au moins **15°**." },
    ],
  },
  "interpolazione": {
    title: "L'interpolation",
    summary: "Linéaire, Bézier et comment le mouvement paraît naturel.",
    steps: [
      { kind: "theory", title: "Comment le logiciel remplit les trous", body: [
        "Entre deux keyframes, le logiciel doit calculer les valeurs intermédiaires : c'est l'**interpolation**. En mode **linéaire**, le mouvement est constant (vitesse identique du début à la fin).",
        "En mode **Bézier**, tu contrôles l'**accélération** et la **décélération** : le mouvement démarre en douceur, accélère puis ralentit.",
      ] },
      { kind: "quiz", question: "Un mouvement linéaire a l'air…", options: ["Naturel et fluide", "Mécanique et robotique", "Aléatoire", "Invisible"], explanation: "Dans la vraie vie, rien ne bouge à vitesse constante : le linéaire est « faux »." },
      { kind: "theory", title: "Les courbes de Bézier", body: [
        "Dans l'éditeur de courbes, chaque keyframe a des **poignées** que tu peux tirer pour contrôler la vitesse d'entrée et de sortie. Plus la courbe est plate, plus le mouvement est lent à cet endroit.",
      ] },
      { kind: "quiz", question: "Une courbe très plate près d'un keyframe signifie…", options: ["Le mouvement y est très lent", "Le mouvement y est très rapide", "Il n'y a pas de mouvement", "La vidéo est en pause"], explanation: "Plat = peu de changement = ralentissement." },
      { kind: "studio", title: "Compare linéaire et Bézier", instructions: "Crée le même mouvement (Échelle de 100 % à 120 %) deux fois : une en **linéaire** et une en **Bézier** (Easy Ease). Observe la différence." },
    ],
  },
  "easing": {
    title: "L'easing",
    summary: "Ease In, Ease Out et le rythme du mouvement.",
    steps: [
      { kind: "theory", title: "Démarrage et freinage", body: [
        "**Ease Out** (le mouvement **ralentit** à l'arrivée) est le plus utilisé en motion design : l'objet arrive en douceur. **Ease In** (le mouvement **accélère** au départ) est plus rare.",
        "**Easy Ease** combine les deux : démarrage doux et arrivée douce.",
      ] },
      { kind: "quiz", question: "Un titre qui arrive et s'arrête en douceur utilise…", options: ["Easy Ease (les deux)", "Linéaire", "Ease In seul", "Pas de keyframes"], explanation: "Easy Ease = accélération au départ + ralentissement à l'arrivée." },
      { kind: "theory", title: "Le raccourci Easy Ease", body: [
        "Sélectionne un keyframe et appuie sur **F9** (Premiere/After Effects) : il passe en Easy Ease instantanément. C'est le raccourci le plus utilisé en animation.",
      ] },
      { kind: "quiz", question: "Quel raccourci applique Easy Ease à un keyframe ?", options: ["F9", "F5", "Ctrl+Z", "F12"], explanation: "F9 : simple, rapide, indispensable." },
      { kind: "studio", title: "Easy Ease sur tout", instructions: "Crée une animation de **Position** (au moins **2 keyframes**) et applique **Easy Ease** (**F9**) aux deux keyframes. Le mouvement doit accélérer puis ralentir." },
    ],
  },
  "codec": {
    title: "Les codecs",
    summary: "H.264, ProRes et quand utiliser lequel.",
    steps: [
      { kind: "theory", title: "Qu'est-ce qu'un codec ?", body: [
        "Un **codec** (COder-DECoder) compresse et décompresse la vidéo. **H.264** est le plus répandu (YouTube, téléphones) : fichiers légers, qualité correcte.",
        "**ProRes** (Apple) et **DNxHR** (Avid) sont moins compressés : fichiers lourds mais montage fluide et meilleure qualité en étalonnage.",
      ], terms: [{ term: "H.264", def: "Codec de diffusion, léger" }, { term: "ProRes", def: "Codec de production, lourd mais haute qualité" }] },
      { kind: "quiz", question: "Tu exportes pour YouTube. Quel codec ?", options: ["ProRes", "H.264", "WAV", "PNG"], explanation: "H.264 est le standard web : léger et compatible partout." },
      { kind: "match", title: "Associe", pairs: [["H.264", "Diffusion / web"], ["ProRes", "Production / étalonnage"], ["H.265", "Comme H.264 mais plus efficace"], ["DNxHR", "Alternative à ProRes (Avid)"]] },
      { kind: "studio", title: "Exporte en H.264", instructions: "Exporte la séquence en **H.264** avec une résolution de **1920×1080**." },
    ],
  },
  "bitrate": {
    title: "Le bitrate",
    summary: "Qualité vs poids du fichier.",
    steps: [
      { kind: "theory", title: "Plus de bits = plus de qualité", body: [
        "Le **bitrate** est la quantité de données par seconde (en Mbps). Plus il est élevé, meilleure est la qualité — mais le fichier est plus lourd.",
        "Pour YouTube en 1080p : **10 à 15 Mbps** est un bon compromis. En dessous de 5 Mbps, des artefacts (blocs, bavures) apparaissent.",
      ] },
      { kind: "quiz", question: "Tu exportes à 2 Mbps en 1080p. Que va-t-il se passer ?", options: ["Image parfaite", "Artefacts visibles (blocs, flou)", "Fichier trop gros", "L'export échoue"], explanation: "2 Mbps est trop faible pour la Full HD." },
      { kind: "theory", title: "CBR vs VBR", body: [
        "**CBR** (Constant Bit Rate) : chaque seconde a le même bitrate. **VBR** (Variable Bit Rate) : le bitrate monte pour les scènes complexes et baisse pour les scènes simples. VBR est presque toujours préférable.",
      ] },
      { kind: "quiz", question: "Quel mode utilise le bitrate le plus intelligemment ?", options: ["CBR", "VBR", "Pas de différence", "Aucun des deux"], explanation: "VBR adapte le bitrate à la complexité de l'image." },
      { kind: "studio", title: "Compare les bitrates", instructions: "Exporte la même séquence en **H.264** à deux bitrates différents : un à **5 Mbps** et un à **15 Mbps**. Compare la qualité." },
    ],
  },
  "export-youtube": {
    title: "Exporter pour YouTube",
    summary: "Les réglages recommandés par YouTube.",
    steps: [
      { kind: "theory", title: "Les recommandations de YouTube", body: [
        "YouTube recommande **H.264**, **1080p** (ou 4K), **audio AAC à 48 kHz** et un bitrate d'au moins **8 Mbps** (15+ pour le 4K).",
        "N'exporte pas en 720p si tu as du 1080p : YouTube compresse davantage les basses résolutions.",
      ] },
      { kind: "quiz", question: "YouTube recommande quelle fréquence audio ?", options: ["44.1 kHz", "48 kHz", "96 kHz", "22 kHz"], explanation: "48 kHz est le standard vidéo." },
      { kind: "theory", title: "Le format high profile", body: [
        "Utilise le **profil High** du H.264 (pas Baseline ou Main) : meilleure qualité à bitrate égal. YouTube le recompresse de toute façon, autant partir du meilleur.",
      ] },
      { kind: "quiz", question: "Pourquoi exporter dans la meilleure qualité pour YouTube si de toute façon il recompresse ?", options: ["Parce que la meilleure source donne un meilleur résultat après recompression", "Ça ne fait aucune différence", "YouTube n'accepte que le ProRes", "Pour économiser de l'espace"], explanation: "Mieux tu donnes, mieux il rend." },
      { kind: "studio", title: "Export YouTube", instructions: "Exporte en **H.264**, **1920×1080**, bitrate entre **10** et **20 Mbps**, audio **AAC 48 kHz**." },
    ],
  },
  "export-social": {
    title: "Exporter pour les réseaux sociaux",
    summary: "Formats et résolutions pour Instagram, TikTok et compagnie.",
    steps: [
      { kind: "theory", title: "Un format par plateforme", body: [
        "**Instagram Reel / TikTok** : 1080×1920 (9:16 vertical). **Instagram Feed** : 1080×1350 (4:5). **Stories** : 1080×1920.",
        "Chaque plateforme recompresse : donne-lui le meilleur fichier possible (bon bitrate, bonne résolution).",
      ] },
      { kind: "quiz", question: "Quel format pour un Reel Instagram ?", options: ["1920×1080", "1080×1920", "1080×1080", "1280×720"], explanation: "Les Reels sont en 9:16, vertical." },
      { kind: "theory", title: "La durée idéale", body: [
        "TikTok/Reel : **15 à 60 secondes** (sweet spot à 30 s). Un post vidéo dans le feed : **15 à 120 secondes**. Stories : **15 secondes** par story.",
      ] },
      { kind: "quiz", question: "Quelle est la durée recommandée pour un Reel ?", options: ["5 secondes", "15 à 60 secondes", "5 minutes", "30 minutes"], explanation: "Court et percutant : les algorithmes favorisent les vidéos regardées jusqu'au bout." },
      { kind: "studio", title: "Export pour les réseaux sociaux", instructions: "Exporte en **H.264**, **1080×1920** (9:16), bitrate entre **6** et **15 Mbps**." },
    ],
  },
  "master": {
    title: "L'export Master",
    summary: "Le fichier de haute qualité à conserver.",
    steps: [
      { kind: "theory", title: "Pourquoi un Master ?", body: [
        "L'export **Master** est la meilleure version possible de ton montage : résolution maximale, codec de haute qualité (ProRes, DNxHR), sans limites de bitrate.",
        "Tu ne le mets pas en ligne : c'est l'original à partir duquel tu crées toutes les autres versions (YouTube, Instagram, TV…).",
      ] },
      { kind: "quiz", question: "À quoi sert l'export Master ?", options: ["À mettre directement en ligne", "À servir de source pour tous les autres exports", "À faire une sauvegarde audio", "À réduire la taille du fichier"], explanation: "Le Master, c'est le négatif numérique de ton montage." },
      { kind: "theory", title: "Master → Dérivés", body: [
        "Du Master tu exportes ensuite des **dérivés** : H.264 pour YouTube, H.264 vertical pour TikTok, etc. Si le client veut un nouveau format dans 6 mois, tu repartiras du Master.",
      ] },
      { kind: "quiz", question: "Le client demande une version 4:5 six mois plus tard. Que fais-tu ?", options: ["Réexporter depuis le Master", "Tout remonter", "Exporter depuis YouTube", "Dire que c'est impossible"], explanation: "Le Master est fait pour ça." },
      { kind: "studio", title: "Exporte le Master", instructions: "Exporte en **ProRes 422** (ou **DNxHR HQ**) à la résolution de la séquence." },
    ],
  },
  "inquadrature": {
    title: "Les plans",
    summary: "Gros plan, plan moyen et quand les utiliser.",
    steps: [
      { kind: "theory", title: "L'échelle des plans", body: [
        "Le **plan d'ensemble** (wide) montre le contexte. Le **plan moyen** (medium) cadre le personnage à mi-corps. Le **gros plan** (close-up) montre un visage ou un détail.",
        "Au montage, alterner les échelles maintient l'attention et transmet l'émotion.",
      ] },
      { kind: "quiz", question: "Quel plan transmet le mieux l'émotion d'un personnage ?", options: ["Plan d'ensemble", "Gros plan", "Plan très large", "Vue aérienne"], explanation: "Le gros plan montre les yeux, les micro-expressions : c'est la fenêtre émotionnelle." },
      { kind: "theory", title: "La règle de la transition d'échelle", body: [
        "Passe d'un plan large à un plan moyen à un gros plan (ou l'inverse) : chaque saut d'échelle maintient l'intérêt. Évite de couper entre deux plans de même échelle.",
      ] },
      { kind: "quiz", question: "Deux plans moyens du même sujet, l'un après l'autre, c'est…", options: ["Dynamique", "Un faux raccord potentiel", "Obligatoire", "Idéal pour les Reels"], explanation: "Même échelle → impression de saut." },
      { kind: "studio", title: "Alterne les plans", instructions: "Monte une séquence de **3 plans** à des **échelles différentes** (large, moyen, gros plan), dans cet ordre." },
    ],
  },
  "regola-180": {
    title: "La règle des 180°",
    summary: "Garder la scène spatiale pour le spectateur.",
    steps: [
      { kind: "theory", title: "La ligne imaginaire", body: [
        "La **règle des 180°** dit que la caméra doit rester d'un **même côté** de la ligne d'action (la ligne entre deux personnages). Si tu franchis la ligne, les directions s'inversent et le spectateur est désorienté.",
      ] },
      { kind: "quiz", question: "Que se passe-t-il si tu franchis la ligne des 180° ?", options: ["Les personnages semblent regarder dans la même direction", "Rien", "L'image est floue", "L'audio s'inverse"], explanation: "L'orientation spatiale est perdue : le spectateur est confus." },
      { kind: "theory", title: "Quand la casser", body: [
        "La règle peut être cassée **volontairement** pour créer une désorientation (tension, confusion). Mais il faut que ce soit un choix artistique, pas une erreur.",
      ] },
      { kind: "quiz", question: "Casser la règle des 180° volontairement peut servir à…", options: ["Créer de la tension ou de la confusion", "Améliorer la qualité", "Accélérer le montage", "Réduire la taille du fichier"], explanation: "C'est un outil narratif quand c'est intentionnel." },
      { kind: "studio", title: "Respecte la ligne", instructions: "Monte un dialogue entre deux personnages en **3 plans** minimum, en gardant la **caméra du même côté** de la ligne d'action." },
    ],
  },
  "continuita": {
    title: "La continuité",
    summary: "Les faux raccords que le spectateur remarque toujours.",
    steps: [
      { kind: "theory", title: "Les raccords", body: [
        "La **continuité** (ou raccord) maintient la cohérence entre deux plans : même direction du regard, même position des objets, même lumière. Le spectateur ne remarque pas la bonne continuité, mais il **remarque toujours** la mauvaise.",
      ] },
      { kind: "quiz", question: "Le personnage tient son verre dans la main droite, puis dans la gauche au plan suivant. C'est…", options: ["Un raccord parfait", "Un faux raccord", "Un J-cut", "Normal"], explanation: "Le spectateur remarquera instantanément." },
      { kind: "theory", title: "Les erreurs les plus courantes", body: [
        "Les erreurs les plus courantes : **direction du regard** (une personne regarde à gauche puis soudain à droite), **position des bras/objets**, **niveau sonore incohérent** entre deux plans.",
      ] },
      { kind: "quiz", question: "Quelle erreur de continuité est la plus facile à corriger au montage ?", options: ["Niveau sonore", "Position des bras", "Lumière", "Costume"], explanation: "Le son peut être corrigé ; les détails physiques sont fixés dans l'image." },
      { kind: "studio", title: "Vérifie la continuité", instructions: "Monte **3 plans consécutifs** d'une même scène en veillant à ce que la **direction du regard** et la **position des objets** soient cohérentes." },
    ],
  },
  "alternato": {
    title: "Le champ-contrechamp",
    summary: "Le montage d'un dialogue.",
    steps: [
      { kind: "theory", title: "Qui parle, qui écoute", body: [
        "Le **champ-contrechamp** est le montage classique d'un dialogue : on montre celui qui parle, puis celui qui écoute, puis à nouveau celui qui parle. Simple et efficace.",
        "La réaction de celui qui écoute est souvent **plus importante** que les mots de celui qui parle.",
      ] },
      { kind: "quiz", question: "Dans un dialogue, montrer la réaction de l'auditeur est…", options: ["Inutile", "Souvent plus puissant que montrer celui qui parle", "Obligatoire uniquement en plan large", "Un faux raccord"], explanation: "La réaction dit tout : surprise, colère, joie." },
      { kind: "theory", title: "Varier le rythme", body: [
        "Pas besoin de couper à chaque réplique : laisse parfois la caméra sur celui qui écoute pendant 2 ou 3 répliques. Ou montre un **insert** (un détail de la scène).",
      ] },
      { kind: "quiz", question: "Couper à chaque réplique systématiquement rend le montage…", options: ["Dynamique", "Prévisible et ennuyeux", "Cinématographique", "Plus court"], explanation: "La prévisibilité tue l'intérêt." },
      { kind: "studio", title: "Monte un dialogue", instructions: "Monte un échange en utilisant au moins **4 coupes** de champ-contrechamp, dont **au moins un plan de réaction** (montrer celui qui écoute pendant que l'autre parle)." },
    ],
  },
  "ritmo": {
    title: "Le rythme",
    summary: "Quand couper pour que ça « groove ».",
    steps: [
      { kind: "theory", title: "Le rythme invisible", body: [
        "Le **rythme** est la durée de chaque plan et l'enchaînement entre eux. Un rythme rapide (plans courts) crée de l'énergie ; un rythme lent (plans longs) crée de la tension ou de la contemplation.",
        "Le meilleur rythme est celui que le spectateur **ressent sans le remarquer**.",
      ] },
      { kind: "quiz", question: "Des plans très courts les uns après les autres créent…", options: ["De l'énergie et de l'urgence", "De l'ennui", "De la tristesse", "De la confusion"], explanation: "Le rythme rapide = énergie, action, tension." },
      { kind: "theory", title: "Couper sur le beat", body: [
        "Quand il y a de la musique, aligne tes coupes sur les **beats** (temps forts). Pose des marqueurs (**M**) sur les beats, puis coupe dessus : le montage et la musique ne font plus qu'un.",
      ] },
      { kind: "quiz", question: "Comment aligner facilement les coupes sur la musique ?", options: ["Marqueurs sur les beats + coupes dessus", "À l'œil", "Exporter et réécouter", "Impossible"], explanation: "La méthode des marqueurs est rapide et précise." },
      { kind: "studio", title: "Monte sur la musique", instructions: "Écoute la musique, pose **au moins 4 marqueurs** sur les beats, puis monte tes coupes pour qu'elles tombent **sur les marqueurs**." },
    ],
  },
  "b-roll": {
    title: "Le B-Roll",
    summary: "Les images d'illustration qui enrichissent le montage.",
    steps: [
      { kind: "theory", title: "Qu'est-ce que le B-Roll ?", body: [
        "Le **B-Roll** est un plan d'illustration qui complète le plan principal (A-Roll). Pendant qu'une personne parle de café, tu montres du café. Pendant qu'elle parle de la ville, tu montres la ville.",
        "Le B-Roll couvre les coupes, cache les jump cuts et rend le montage **plus riche**.",
      ] },
      { kind: "quiz", question: "L'interview a des jump cuts. Comment les cacher ?", options: ["Couper le B-Roll par-dessus", "Ajouter des transitions", "Accélérer la vidéo", "Les laisser"], explanation: "Le B-Roll couvre le saut et ajoute du sens." },
      { kind: "theory", title: "Placer le B-Roll sur V2", body: [
        "Mets le B-Roll sur la piste **V2** (au-dessus de l'interview sur V1) : tu gardes l'audio de l'interview et tu vois le B-Roll. Quand le B-Roll finit, on revoit l'interview.",
      ] },
      { kind: "quiz", question: "Le B-Roll va sur quelle piste ?", options: ["V1 (même piste que l'interview)", "V2 (au-dessus)", "A1 (piste audio)", "N'importe où"], explanation: "V2 superpose l'image sans toucher à l'audio de V1." },
      { kind: "studio", title: "Couvre les coupes", instructions: "Place au moins **2 clips de B-Roll** sur **V2** au-dessus de l'interview pour couvrir les moments de coupe." },
    ],
  },
  "sync-audio": {
    title: "La synchronisation audio",
    summary: "Aligner un micro externe avec la vidéo.",
    steps: [
      { kind: "theory", title: "Le clap et la synchro", body: [
        "Quand l'audio est enregistré séparément (micro-cravate, enregistreur), il faut le **synchroniser** avec la vidéo. Le **clap** (ou claquement de mains) crée un pic visible dans les deux formes d'onde.",
        "Tu alignes les pics et désactives l'audio de la caméra.",
      ] },
      { kind: "quiz", question: "Pourquoi faire un clap au début de chaque prise ?", options: ["Pour créer un pic de synchro dans les deux pistes", "Par tradition", "Pour vérifier le volume", "Pour l'effet sonore"], explanation: "Le pic est la marque de synchronisation." },
      { kind: "theory", title: "La synchro automatique", body: [
        "Premiere a un outil **Synchroniser** (clic droit → Synchroniser par forme d'onde) qui compare les formes d'onde et aligne automatiquement. Ça marche dans 90 % des cas.",
      ] },
      { kind: "quiz", question: "La synchronisation automatique par forme d'onde échoue. Que fais-tu ?", options: ["Synchro manuelle sur le clap", "Supprimer l'audio", "Recommencer le tournage", "Augmenter le volume"], explanation: "Le clap est la solution de secours qui marche toujours." },
      { kind: "studio", title: "Synchronise la prise", instructions: "Aligne l'audio externe avec la vidéo en utilisant le **pic du clap** (forme d'onde). Désactive ensuite l'audio de la caméra." },
    ],
  },
  "multicam": {
    title: "Le montage multicaméra",
    summary: "Alterner entre plusieurs angles en temps réel.",
    steps: [
      { kind: "theory", title: "Plusieurs caméras, un montage", body: [
        "Le **montage multicam** permet de basculer entre plusieurs angles comme un réalisateur en direct. Tu synchronises les caméras, crées une **séquence multicam** et alternes en regardant la lecture.",
      ] },
      { kind: "quiz", question: "Quel est l'avantage principal du multicam ?", options: ["Monter plusieurs angles rapidement comme en direct", "Améliorer la résolution", "Ajouter des effets automatiquement", "Réduire la taille du fichier"], explanation: "Tu « réalises » en temps réel : rapide et intuitif." },
      { kind: "theory", title: "La synchronisation", body: [
        "Les caméras doivent être **synchronisées** : par le timecode, par l'audio (forme d'onde) ou par un clap. Sans synchro, le multicam ne fonctionne pas.",
      ] },
      { kind: "quiz", question: "Comment synchroniser des caméras pour le multicam ?", options: ["Par timecode, audio ou clap", "Par le nom du fichier", "Par la taille du fichier", "Par l'ordre d'import"], explanation: "La synchro se base sur un point commun dans le temps." },
      { kind: "studio", title: "Monte en multicam", instructions: "Crée une **séquence multicam** à partir d'au moins **2 angles** synchronisés. Effectue au moins **3 changements d'angle**." },
    ],
  },
  "tagliare-intervista": {
    title: "Monter une interview",
    summary: "Les techniques pour un récit fluide.",
    steps: [
      { kind: "theory", title: "Le paper edit", body: [
        "Avant de monter, lis la **transcription** et surligne les meilleurs passages. Arrange-les dans un **ordre narratif** (pas forcément chronologique). C'est le **paper edit** : le montage sur papier.",
      ] },
      { kind: "quiz", question: "Pourquoi faire un « paper edit » avant de monter ?", options: ["Pour avoir une structure narrative avant de toucher la timeline", "Pour imprimer l'interview", "Pour le client", "Ce n'est pas utile"], explanation: "Savoir ce que tu veux dire avant de commencer à couper." },
      { kind: "theory", title: "Couper les hésitations", body: [
        "Les « euh », les silences trop longs, les faux départs se coupent. Mais garde les **pauses naturelles** : un silence avant une phrase importante est puissant.",
      ] },
      { kind: "quiz", question: "Faut-il couper toutes les pauses dans une interview ?", options: ["Non, certaines pauses sont expressives", "Oui, toutes", "Non, aucune", "Seulement les plus longues"], explanation: "Les pauses significatives ajoutent du poids aux mots." },
      { kind: "studio", title: "Monte l'interview", instructions: "Monte l'interview en gardant les **meilleurs passages**, en coupant les hésitations et en couvrant au moins une coupe avec du **B-Roll** sur V2." },
    ],
  },
  "jump-cut": {
    title: "Le jump cut",
    summary: "Le couper de YouTube et quand l'utiliser.",
    steps: [
      { kind: "theory", title: "Le saut assumé", body: [
        "Le **jump cut** est une coupe dans un même plan qui crée un **saut visible**. Au cinéma, c'est une erreur. Sur YouTube, c'est un **style** : rapide, direct, énergique.",
        "Le jump cut fonctionne quand le rythme est rapide et le contenu intéressant. Il est gênant dans un contexte lent ou narratif.",
      ] },
      { kind: "quiz", question: "Quand le jump cut est-il un choix acceptable ?", options: ["Jamais", "Dans un contenu rapide et direct (style YouTube)", "Toujours", "Seulement en 4K"], explanation: "Le contexte fait tout : énergie = OK, narration = non." },
      { kind: "theory", title: "Alternatives au jump cut", body: [
        "Si tu ne veux pas de jump cut : couvre avec du **B-Roll**, change d'**angle** (multicam), ajoute un **zoom léger** (punch in) entre les coupes.",
      ] },
      { kind: "quiz", question: "Comment éviter un jump cut dans une interview ?", options: ["Couvrir avec du B-Roll", "Augmenter le volume", "Ajouter un fondu au noir entre chaque phrase", "Laisser le jump cut"], explanation: "Le B-Roll cache le saut." },
      { kind: "studio", title: "Trois jump cuts propres", instructions: "Monte un passage avec **3 jump cuts** rapides. Chaque coupe doit retirer un moment de pause ou d'hésitation." },
    ],
  },
  "rallenty": {
    title: "Le ralenti",
    summary: "Comment bien ralentir un clip.",
    steps: [
      { kind: "theory", title: "Images et ralenti", body: [
        "Pour un **beau ralenti**, il faut plus d'images : un clip à **60 fps** peut être ralenti à **40 %** (sur une séquence à 24/25 fps) avec un résultat fluide. Un clip à 24 fps ralenti sera **saccadé**.",
      ] },
      { kind: "quiz", question: "Un clip à 30 fps ralenti à 50 % dans une séquence 30 fps donne…", options: ["15 fps effectifs : saccadé", "30 fps : parfait", "60 fps", "Aucune différence"], explanation: "La moitié de 30 = 15 fps : pas assez pour un résultat fluide." },
      { kind: "theory", title: "Appliquer le ralenti", body: [
        "Clic droit sur le clip → **Vitesse/Durée** et choisis un pourcentage inférieur à 100 %. Ou fais-le glisser en maintenant Ctrl pour un ajustement visuel.",
      ] },
      { kind: "quiz", question: "50 % de vitesse signifie…", options: ["Le clip dure deux fois plus longtemps (moitié vitesse)", "Le clip dure deux fois moins longtemps", "Le clip est inversé", "Le clip est supprimé"], explanation: "50 % = moitié vitesse = double durée." },
      { kind: "studio", title: "Ralenti fluide", instructions: "Ralentis un clip à **50 %** ou moins. Si le clip est à 60 fps, le résultat doit être **fluide**." },
    ],
  },
  "time-remapping": {
    title: "Le time remapping",
    summary: "Varier la vitesse à l'intérieur d'un même clip.",
    steps: [
      { kind: "theory", title: "Vitesse variable", body: [
        "Le **time remapping** (remappage temporel) change la vitesse d'un clip **dans le temps** : un moment en vitesse normale, un moment en ralenti, puis une accélération. Le résultat est spectaculaire.",
        "C'est la technique derrière les fameux « speed ramps » qu'on voit dans les clips et les pubs.",
      ] },
      { kind: "quiz", question: "Qu'est-ce qu'une speed ramp ?", options: ["Une transition d'une vitesse à une autre dans un même clip", "Un effet audio", "Un type de codec", "Un logiciel"], explanation: "Le passage progressif d'une vitesse à une autre." },
      { kind: "theory", title: "Keyframes de vitesse", body: [
        "Active le Time Remapping sur le clip : une **ligne de vitesse** apparaît. Ajoute des keyframes et glisse-les vers le haut (plus rapide) ou vers le bas (plus lent).",
      ] },
      { kind: "quiz", question: "Dans le Time Remapping, la ligne vers le haut signifie…", options: ["Plus lent", "Plus rapide", "Marche arrière", "Pas d'effet"], explanation: "En haut = plus de vitesse." },
      { kind: "studio", title: "Speed ramp", instructions: "Active le **Time Remapping** sur un clip et crée une **speed ramp** : vitesse normale → ralenti → vitesse normale, avec au moins **4 keyframes**." },
    ],
  },
  "fps": {
    title: "Les images par seconde",
    summary: "24, 25, 30, 60 : à chaque usage sa fréquence.",
    steps: [
      { kind: "theory", title: "Qu'est-ce que le fps ?", body: [
        "Le **fps** (frames per second) est le nombre d'images affichées chaque seconde. **24 fps** = cinéma. **25 fps** = TV européenne (PAL). **30 fps** = TV américaine (NTSC). **60 fps** = sport, jeux, ralenti.",
      ] },
      { kind: "quiz", question: "Quel fps est associé au « look cinéma » ?", options: ["24", "30", "60", "120"], explanation: "24 fps est le standard du cinéma depuis presque 100 ans." },
      { kind: "theory", title: "Choisir le bon fps", body: [
        "La règle : la **séquence** doit être au même fps que le fichier source. Si tu mélanges 24 et 30, il y aura des saccades. Si tu tournes en 60 fps, c'est pour le **ralenti** : la séquence reste en 24/25/30.",
      ] },
      { kind: "quiz", question: "Tu as un fichier à 60 fps. Quel fps pour la séquence si tu veux du ralenti ?", options: ["60", "24 ou 25 ou 30", "120", "15"], explanation: "La séquence en 24/30, le clip 60 fps sera ralenti (×2 ou ×2,5)." },
      { kind: "studio", title: "Interprète le clip", instructions: "Mets un clip 60 fps dans une séquence **24** ou **30 fps** et ralentis-le pour que le mouvement soit **fluide**." },
    ],
  },
  "fermo-immagine": {
    title: "L'arrêt sur image",
    summary: "Geler le temps sur une image.",
    steps: [
      { kind: "theory", title: "Pourquoi geler le temps", body: [
        "L'**arrêt sur image** (freeze frame) fige une image précise du clip : pour un titre, un moment comique, une fin dramatique. La vidéo s'arrête mais le son peut continuer.",
      ] },
      { kind: "quiz", question: "Quand utiliser un arrêt sur image ?", options: ["Pour souligner un moment, un titre ou une fin", "Pour chaque plan", "Pour réduire la taille du fichier", "Pour corriger la couleur"], explanation: "C'est un outil ponctuel et puissant." },
      { kind: "theory", title: "Comment le faire", body: [
        "En Premiere : place le curseur sur la bonne image et fais **clic droit → Ajouter l'option Image figée**. Une nouvelle image fixe apparaît dans la timeline, que tu peux rallonger.",
      ] },
      { kind: "quiz", question: "Tu as ajouté une image figée. Comment l'allonger ?", options: ["Tirer le bord dans la timeline", "La dupliquer 10 fois", "Augmenter le fps", "Exporter et réimporter"], explanation: "C'est un clip comme un autre : tu le rallonges en tirant." },
      { kind: "studio", title: "Freeze frame dramatique", instructions: "Crée un **arrêt sur image** sur le meilleur moment du clip, d'une durée d'au moins **2 secondes**." },
    ],
  },
  "reverse": {
    title: "La marche arrière",
    summary: "Inverser la lecture d'un clip.",
    steps: [
      { kind: "theory", title: "À l'envers", body: [
        "La **marche arrière** (reverse) inverse la lecture du clip : la fin devient le début. Effet saisissant pour des transitions, des moments comiques ou un rewind créatif.",
      ] },
      { kind: "quiz", question: "Un clip inversé montre…", options: ["La fin d'abord, puis le début", "La même chose mais en miroir", "Uniquement l'audio inversé", "Rien de différent"], explanation: "La lecture temporelle est inversée." },
      { kind: "theory", title: "Comment l'appliquer", body: [
        "Clic droit sur le clip → **Vitesse/Durée** → cocher **Marche arrière**. Tu peux aussi combiner avec un ralenti pour un reverse au ralenti.",
      ] },
      { kind: "quiz", question: "Tu veux un reverse au ralenti. Que fais-tu ?", options: ["Vitesse négative (ex. −50 %)", "Vitesse à 200 %", "Ajouter un fondu enchaîné", "Dupliquer le clip"], explanation: "Un pourcentage négatif en dessous de 100 = reverse + ralenti." },
      { kind: "studio", title: "Reverse un clip", instructions: "Inverse un clip pour qu'il **se joue à l'envers** et vérifie que la lecture est correcte." },
    ],
  },
  "testi": {
    title: "Les titres",
    summary: "Ajouter du texte lisible et bien conçu.",
    steps: [
      { kind: "theory", title: "Lisibilité d'abord", body: [
        "Un titre doit être **lisible en un clin d'œil** : police simple, taille suffisante, **contour** (stroke) ou **ombre** pour se détacher du fond. Pas plus de **2 polices** dans une même vidéo.",
        "Les polices sans-serif (**Montserrat, Inter, Bebas Neue**) sont les plus utilisées en vidéo.",
      ] },
      { kind: "quiz", question: "Pourquoi ajouter un contour ou une ombre au texte ?", options: ["Pour le style", "Pour qu'il reste lisible sur n'importe quel fond", "Ce n'est pas nécessaire", "Pour l'animation"], explanation: "Sans contour/ombre, le texte blanc disparaît sur le ciel clair." },
      { kind: "theory", title: "Hiérarchie visuelle", body: [
        "Le titre principal est **grand et gras**. Le sous-titre est **plus petit et léger**. La même logique que sur une affiche : le plus important attire le regard en premier.",
      ] },
      { kind: "quiz", question: "Deux textes à l'écran : un grand gras et un petit léger. Le spectateur lit d'abord…", options: ["Le petit", "Le grand gras", "Les deux en même temps", "Aucun des deux"], explanation: "La taille et la graisse guident le regard." },
      { kind: "studio", title: "Un titre lisible", instructions: "Crée un titre avec une **police sans-serif**, **taille suffisante**, un **contour** ou une **ombre**, et place-le dans la zone **sûre** (Title Safe)." },
    ],
  },
  "lower-third": {
    title: "Le bandeau-titre",
    summary: "Identifier quelqu'un à l'écran.",
    steps: [
      { kind: "theory", title: "Nom et fonction", body: [
        "Le **bandeau-titre** (lower third) affiche le **nom** et la **fonction** d'une personne dans le tiers inférieur de l'écran. C'est la norme dans les interviews, les documentaires et les journaux télévisés.",
        "Il reste à l'écran **3 à 5 secondes** : assez pour lire, pas assez pour gêner.",
      ] },
      { kind: "quiz", question: "Combien de temps un bandeau-titre reste-t-il à l'écran ?", options: ["1 seconde", "3 à 5 secondes", "Toute la vidéo", "10 secondes"], explanation: "Assez pour lire, pas assez pour encombrer." },
      { kind: "theory", title: "Conception simple", body: [
        "Un bandeau-titre réussi est **simple** : un fond semi-transparent (ou une ligne), le nom en gras, la fonction en léger. Pas plus de 2 couleurs.",
      ] },
      { kind: "quiz", question: "Comment rendre un bandeau-titre lisible sur n'importe quel fond ?", options: ["Fond semi-transparent derrière le texte", "Texte très petit", "Pas de fond, juste du texte", "Fond de couleur vive"], explanation: "Le fond semi-transparent garantit la lisibilité." },
      { kind: "studio", title: "Crée un bandeau-titre", instructions: "Crée un bandeau-titre avec le **nom** et le **rôle** d'une personne, dans le **tiers inférieur** de l'écran, avec un fond **semi-transparent**." },
    ],
  },
  "safe-margin": {
    title: "Les marges de sécurité",
    summary: "Pourquoi ne pas écrire au bord de l'écran.",
    steps: [
      { kind: "theory", title: "Les zones sûres", body: [
        "Tous les écrans ne montrent pas la même zone : certains TV coupent les bords (overscan). Les **marges de sécurité** (Title Safe et Action Safe) sont des lignes guides qui montrent la zone visible à coup sûr.",
        "Règle : tout le texte dans le **Title Safe** (90 % de l'image), toute l'action dans l'**Action Safe** (93 %).",
      ] },
      { kind: "quiz", question: "Tu places un titre au bord de l'écran. Quel risque ?", options: ["Le titre sera coupé sur certains écrans", "Le titre sera plus lisible", "Aucun risque", "L'export échouera"], explanation: "L'overscan coupe les bords : le texte disparaît." },
      { kind: "theory", title: "Activer les guides", body: [
        "Dans Premiere : clic droit sur le Program Monitor → **Safe Margins**. Des lignes guides apparaissent : garde tes titres à l'intérieur.",
      ] },
      { kind: "quiz", question: "Quelle est la zone la plus restreinte (la plus sûre) ?", options: ["Action Safe", "Title Safe", "Toute l'image", "Le hors-champ"], explanation: "Title Safe est plus petit qu'Action Safe : plus sûr pour le texte." },
      { kind: "studio", title: "Dans la zone sûre", instructions: "Active les **Safe Margins** et place un titre entièrement à l'intérieur de la zone **Title Safe**." },
    ],
  },
  "sottotitoli": {
    title: "Les sous-titres",
    summary: "Ajouter et corriger les sous-titres.",
    steps: [
      { kind: "theory", title: "Pourquoi sous-titrer", body: [
        "**85 %** des vidéos sur les réseaux sont regardées **sans le son**. Les sous-titres rendent ta vidéo accessible, augmentent la rétention et sont obligatoires pour les personnes malentendantes.",
      ] },
      { kind: "quiz", question: "Pourquoi les sous-titres sont-ils essentiels sur les réseaux sociaux ?", options: ["Pour le SEO uniquement", "Parce que la majorité des gens regardent sans le son", "Ce n'est pas essentiel", "Pour l'étalonnage"], explanation: "85 % de visionnage muet : sans sous-titres, le message passe pas." },
      { kind: "theory", title: "Outils de sous-titrage", body: [
        "Premiere a un outil de **sous-titrage automatique** (Texte → Transcrire la séquence). Il génère les sous-titres, mais il faut toujours les **corriger** : les noms propres et les termes techniques sont souvent mal reconnus.",
      ] },
      { kind: "quiz", question: "Pourquoi corriger les sous-titres auto-générés ?", options: ["Jamais nécessaire", "La reconnaissance fait souvent des erreurs sur les noms et les termes techniques", "Pour les rallonger", "Pour changer la langue"], explanation: "La transcription automatique est un bon point de départ, pas le résultat final." },
      { kind: "theory", title: "Règles d'or", body: [
        "Maximum **2 lignes**, environ **35 à 42 caractères** par ligne, chacune affichée au moins **1 seconde**. Blanc avec contour ou fond noir : lisible sur tout.",
      ] },
      { kind: "quiz", question: "Combien de lignes maximum pour un sous-titre ?", options: ["1", "2", "4", "Autant que nécessaire"], explanation: "Deux lignes : au-delà, on ne peut pas lire à temps." },
      { kind: "studio", title: "Sous-titre la première phrase", instructions: "Ajoute un sous-titre indiquant **Bonjour à tous !** dans la partie **basse** de l'écran (en dessous de 860 px), avec un **fond de sous-titre** activé, d'une durée de **0** à environ **2 à 4 s**.", goals: ["Texte **Bonjour à tous !**", "En bas", "Avec un **fond de sous-titre**", "Dure **2 à 4 s** depuis le début"] },
    ],
  },
  "grafiche-essenziali": {
    title: "Les graphismes essentiels",
    summary: "Utiliser et personnaliser des modèles.",
    steps: [
      { kind: "theory", title: "Modèles prêts à l'emploi", body: [
        "Le panneau **Essential Graphics** contient des **modèles** de titres, bandeaux-titres, sous-titres. Glisse-les dans la timeline et modifie le texte, les couleurs et la police.",
        "Tu peux aussi créer tes **propres** modèles et les réutiliser dans tous tes projets : ainsi chaque vidéo de ta chaîne a le même style.",
      ] },
      { kind: "quiz", question: "Pourquoi créer ses propres modèles graphiques ?", options: ["Pour un style cohérent dans toutes les vidéos", "Pour un export plus rapide", "Pour plus de pistes", "Ce n'est pas nécessaire"], explanation: "Cohérence = identité visuelle de la marque." },
      { kind: "theory", title: "Plusieurs calques dans un graphisme", body: [
        "Un clip graphique peut contenir **plusieurs calques** : texte, rectangles, ellipses. Avec le graphisme sélectionné, crée un nouveau calque et il s'ajoute à l'intérieur du même clip.",
      ] },
      { kind: "quiz", question: "Tu veux un rectangle coloré derrière le nom. Qu'ajoutes-tu ?", options: ["Un calque forme (rectangle) dans le même graphisme", "Une nouvelle séquence", "Un effet audio", "Une transition"], explanation: "Texte + forme dans le même clip graphique." },
      { kind: "studio", title: "Personnalise un modèle", instructions: "Utilise le modèle **Large Caption** (ou un autre) depuis **Essential Graphics → Parcourir**, change le texte pour **CHAPITRE 2** et ajoute un **rectangle** au même graphisme.", goals: ["Texte **CHAPITRE 2**", "Un **rectangle** dans le même graphisme"] },
    ],
  },

  // Section 3
  "rec709": { title: "Qu'est-ce que le Rec.709", summary: "Le standard couleur de toutes les vidéos que vous regardez.", steps: [
    { kind: "theory", title: "Un standard pour tous", body: ["**Rec.709** est le standard de la vidéo HD : il définit quelles couleurs existent (l'**espace colorimétrique**), comment la luminosité est distribuée (le **gamma**) et où se situent le blanc et le noir.", "Presque tout ce que vous regardez sur YouTube, la TV et le téléphone est (ou finit) en Rec.709. C'est le « langage commun » entre votre timeline et l'écran du spectateur."], terms: [{ term: "Espace colorimétrique", def: "L'ensemble des couleurs reproductibles" }, { term: "Gamma", def: "Comment les valeurs deviennent de la luminosité" }] },
    { kind: "quiz", question: "Pourquoi travailler en Rec.709 pour YouTube ?", options: ["Parce que c'est plus léger", "Parce que c'est le standard que les écrans attendent", "Parce que c'est en noir et blanc", "On ne travaille pas en Rec.709"], explanation: "Si la timeline parle Rec.709, ce que vous voyez est ce que le spectateur verra." },
    { kind: "theory", title: "Image « plate »", body: ["Beaucoup de caméras enregistrent de façon **plate** (faible contraste et saturation) pour préserver les détails. La première étape de l'étalonneur est de ramener cette image à un **Rec.709 normal** : des noirs noirs, des blancs blancs, des couleurs crédibles."] },
    { kind: "quiz", question: "Une image grise et délavée à l'import a besoin de…", options: ["Plus de contraste et de saturation", "Moins de contraste", "Un effet audio", "Une transition"], explanation: "Ramenez-la à un aspect normal avant toute correction créative." },
    { kind: "studio", title: "De plat à normal", instructions: "Le coucher de soleil est **plat**. Avec **Lumetri Color**, ramenez-le à un aspect normal : **Contraste** global d'au moins **+20** et **Saturation** d'au moins **110**.", goals: ["Contraste global ≥ **+20**", "Saturation globale ≥ **110**"] },
    { kind: "match", title: "Associe", pairs: [["Rec.709", "Standard vidéo HD"], ["Espace colorimétrique", "Quelles couleurs existent"], ["Gamma", "Distribution de la luminosité"], ["Plat", "Faible contraste et saturation"]] },
  ] },
  "gamma": { title: "Espaces colorimétriques et gamma", summary: "Pourquoi le même fichier a un rendu différent sur deux écrans.", steps: [
    { kind: "theory", title: "Même fichier, écrans différents", body: ["Un téléphone à luminosité maximale, un écran bon marché et une TV montrent la même vidéo différemment. C'est pourquoi les étalonneurs utilisent un moniteur **calibré**.", "Le **Gamma** décide comment les tons moyens deviennent de la lumière : un gamma plus élevé assombrit les tons moyens, un gamma plus bas les éclaircit."] },
    { kind: "quiz", question: "Pourquoi les étalonneurs utilisent-ils des moniteurs calibrés ?", options: ["Pour un meilleur gaming", "Pour voir les vraies couleurs, pas ce que l'écran invente", "Parce qu'ils coûtent moins cher", "Ce n'est pas nécessaire"], explanation: "Si l'écran ment, chaque correction est fausse." },
    { kind: "theory", title: "Les tons moyens avec Levels", body: ["L'effet **Levels** a un curseur **Gamma** : au-dessus de 1 il éclaircit les tons moyens **sans** toucher les noirs et les blancs. La façon la plus propre d'ouvrir une image un peu sombre."] },
    { kind: "quiz", question: "Vous voulez éclaircir des visages dans l'ombre sans cramer le ciel. Que réglez-vous ?", options: ["Le Gamma (tons moyens)", "Le point blanc", "Le volume", "La durée"], explanation: "Le Gamma agit sur les tons moyens et laisse les extrêmes tranquilles." },
    { kind: "studio", title: "Ouvrez les tons moyens", instructions: "L'interview est un peu sombre dans les tons moyens. Appliquez l'effet **Levels** (Effets vidéo → Réglage) et amenez le **Gamma** entre **1.2** et **1.6**.", goals: ["Gamma de Levels entre **1.2** et **1.6**"] },
  ] },
  "log": { title: "Log vs Rec.709", summary: "Pourquoi les images Log sont grises et comment les corriger.", steps: [
    { kind: "theory", title: "Le profil Log", body: ["Les caméras modernes enregistrent en **Log** (S-Log, V-Log, C-Log…) : une courbe qui compresse les hautes lumières et les ombres pour **préserver plus de dynamique**.", "Le résultat est **gris et délavé**. Ce n'est pas une erreur : c'est un négatif numérique qui doit être **converti** en Rec.709 (avec une LUT technique ou manuellement)."] },
    { kind: "quiz", question: "Pourquoi les images Log sont-elles grises ?", options: ["La caméra est en panne", "La courbe Log compresse les hautes lumières et les ombres pour préserver les détails", "L'audio manque", "C'est du noir et blanc"], explanation: "C'est voulu : plus d'informations à récupérer ensuite." },
    { kind: "theory", title: "Le bon ordre", body: ["D'abord **convertir** le Log (LUT technique ou correction), puis **corriger** (exposition, balance), puis créer le **look**. Inverser l'ordre complique tout."] },
    { kind: "quiz", question: "Quel est l'ordre correct ?", options: ["Look → conversion → correction", "Conversion → correction → look", "Correction → look → conversion", "L'ordre n'a pas d'importance"], explanation: "D'abord ramener en Rec.709, puis corriger, puis créer le style." },
    { kind: "studio", title: "Convertir le Log manuellement", instructions: "Le drone a été filmé en **Log** : gris et plat. Avec Lumetri, amenez le **Contraste** global à au moins **0** et la **Saturation** à au moins **95**.", goals: ["Contraste global ≥ **0**", "Saturation globale ≥ **95**"] },
    { kind: "studio", title: "Puis le look", instructions: "Maintenant que le drone est converti, ajoutez **après** le Lumetri un effet **Apply Color LUT** avec le look **Cinematic teal & orange**.", goals: ["LUT **Cinematic teal & orange**", "La LUT vient **après** Lumetri"] },
  ] },
  "bit-depth": { title: "Profondeur de bits et compression", summary: "8 bits, 10 bits et le banding.", steps: [
    { kind: "theory", title: "Combien de nuances", body: ["La **profondeur de bits** indique combien de nuances chaque canal possède : **8 bits** = 256 niveaux, **10 bits** = 1024. Avec plus de niveaux, les transitions graduelles (un ciel, un mur) restent lisses.", "Avec peu de bits et une forte compression, on obtient du **banding** : des bandes visibles au lieu d'un dégradé lisse."] },
    { kind: "quiz", question: "Combien de niveaux par canal a une vidéo 10 bits ?", options: ["256", "1024", "16", "10"], explanation: "2 puissance 10 = 1024 niveaux, quatre fois plus que le 8 bits." },
    { kind: "theory", title: "Combattre le banding", body: ["La prévention est la meilleure solution (filmer en 10 bits, ne pas pousser la correction trop fort). Si c'est déjà là, un soupçon de **grain** (*Add Grain*) casse les bandes et les rend invisibles."] },
    { kind: "quiz", question: "Un ciel de coucher de soleil montre des bandes de couleur. Que faire ?", options: ["Ajouter un peu de grain", "Pousser la saturation au maximum", "Exporter à 1 Mbps", "Ralentir la vidéo"], explanation: "Le grain masque les marches entre les niveaux." },
    { kind: "studio", title: "Masquer le banding", instructions: "Le ciel du coucher de soleil a du banding. Ajoutez **Add Grain** (Noise & Grain) avec une **Intensité** d'au moins **1.5**.", goals: ["Grain avec intensité ≥ **1.5**"] },
    { kind: "match", title: "Associe", pairs: [["8 bits", "256 niveaux"], ["10 bits", "1024 niveaux"], ["Banding", "Bandes dans les dégradés"], ["Grain", "Casse les bandes"]] },
  ] },
  "hdr": { title: "Le HDR en bref", summary: "Ce qui change avec le PQ et le HLG.", steps: [
    { kind: "theory", title: "High Dynamic Range", body: ["Le **HDR** permet des hautes lumières bien plus **brillantes** et plus de détails dans les ombres par rapport au SDR (Rec.709). Mesuré en **nits** : le SDR atteint environ 100, le HDR 1000 et au-delà.", "Deux standards principaux : **PQ** (HDR10, Dolby Vision : cinéma et streaming) et **HLG** (diffusion broadcast, compatible avec les TV SDR)."] },
    { kind: "quiz", question: "Quel standard HDR est conçu pour être compatible avec les TV classiques ?", options: ["PQ", "HLG", "Rec.709", "ProRes"], explanation: "Le HLG a un rendu acceptable même sur les écrans SDR." },
    { kind: "theory", title: "Attention aux hautes lumières cramées", body: ["En SDR, les hautes lumières au-delà de 100 % sont **cramées** (blanc uniforme sans détail). Même en SDR, gardez les blancs sous la limite : les détails perdus ne se récupèrent pas."] },
    { kind: "quiz", question: "Que signifie « hautes lumières cramées » ?", options: ["Des zones blanches sans aucun détail", "Des couleurs trop saturées", "De l'audio distordu", "Un type de transition"], explanation: "Le capteur (ou la correction) a dépassé le maximum : il ne reste que du blanc." },
    { kind: "studio", title: "Récupérer les hautes lumières", instructions: "Le coucher de soleil est surexposé et le ciel est cramé. Avec Lumetri, amenez l'**Exposition** globale à **≤ 0.3** et les **Hautes lumières** à **≤ 0**.", goals: ["Exposition globale ≤ **0.3**", "Hautes lumières ≤ **0**"] },
  ] },
  "waveform": { title: "La forme d'onde", summary: "Lire les hautes lumières et les ombres avec précision.", steps: [
    { kind: "theory", title: "Mesurer la lumière", body: ["La **forme d'onde** (waveform) montre la luminosité de l'image de **0** (noir) à **100** (blanc), de gauche à droite en correspondance avec l'image.", "Une image bien exposée remplit la majeure partie de l'échelle : noirs entre 0 et 5, blancs entre 90 et 100, sans écraser les extrêmes."] },
    { kind: "quiz", question: "Dans la forme d'onde, le tracé est tout entre 0 et 30. L'image est…", options: ["Surexposée", "Sous-exposée", "Parfaite", "En noir et blanc"], explanation: "Tout en bas = tout sombre." },
    { kind: "theory", title: "L'œil ment, les scopes non", body: ["Au bout d'un moment, l'œil **s'adapte** et une image sombre semble normale. Les **Scopes** (Lumetri Scopes dans Premiere) donnent des chiffres objectifs : faites-leur confiance."] },
    { kind: "quiz", question: "Pourquoi utiliser les scopes plutôt que « l'œil » ?", options: ["Ils sont plus colorés", "L'œil s'adapte et peut se tromper, les scopes mesurent", "Ils sont obligatoires pour l'export", "Ce n'est pas nécessaire"], explanation: "Mesurer au lieu de deviner." },
    { kind: "studio", title: "Remettre à l'échelle", instructions: "Selon la forme d'onde, la ville est **sous-exposée** (tout en bas). Corrigez l'**Exposition** globale entre **−0.4** et **+0.6**.", goals: ["Exposition globale entre **−0.4** et **+0.6**"] },
    { kind: "match", title: "Associe", pairs: [["0 IRE", "Noir"], ["100 IRE", "Blanc"], ["Tracé en bas", "Image sombre"], ["Scopes", "Mesures objectives"]] },
  ] },
  "vectorscope": { title: "Le vectorscope", summary: "Teinte et saturation sous contrôle.", steps: [
    { kind: "theory", title: "Un cercle de couleurs", body: ["Le **vectorscope** est un cercle : la **direction** indique la **teinte** (rouge, jaune, vert, cyan, bleu, magenta), la **distance au centre** indique la **saturation**.", "Une image en noir et blanc est un point au centre. Une image sursaturée s'étend vers les bords, au-delà des repères."] },
    { kind: "quiz", question: "Dans le vectorscope, que représente la distance au centre ?", options: ["La luminosité", "La saturation", "La durée", "Le volume"], explanation: "Plus c'est loin = plus c'est saturé." },
    { kind: "theory", title: "Saturation légale", body: ["Pour la TV, les couleurs ne doivent pas dépasser certaines limites (les repères du vectorscope). Sur le web, vous êtes plus libre, mais des couleurs sursaturées sont fausses et « bavent »."] },
    { kind: "quiz", question: "Une image parfaitement en noir et blanc dans le vectorscope est…", options: ["Un cercle complet", "Un point au centre", "Une ligne vers le rouge", "Invisible"], explanation: "Zéro saturation : tout au centre." },
    { kind: "studio", title: "Trop saturé !", instructions: "Le café a été sursaturé et le vectorscope dépasse les repères. Amenez la **Saturation** globale entre **90** et **120**.", goals: ["Saturation globale **90–120**"] },
  ] },
  "parade": { title: "La parade RGB", summary: "Détecter les dominantes de couleur.", steps: [
    { kind: "theory", title: "Trois canaux côte à côte", body: ["La **parade RGB** montre trois formes d'onde côte à côte : **rouge**, **vert** et **bleu**. Sur quelque chose de neutre (blanc, gris), les trois canaux devraient être à la **même hauteur**.", "Si le bleu est plus haut que les autres, l'image a une **dominante froide** ; si le rouge est plus haut, **chaude**."] },
    { kind: "quiz", question: "Dans la parade, le canal rouge est bien plus haut que le vert et le bleu. L'image est…", options: ["Trop froide", "Trop chaude", "Parfaite", "Sous-exposée"], explanation: "Excès de rouge = dominante chaude." },
    { kind: "theory", title: "Corriger la dominante", body: ["Dans Lumetri : **Température** décale entre bleu et orange, **Teinte** entre vert et magenta. Alignez les canaux sur les zones neutres."] },
    { kind: "quiz", question: "Quel curseur corrige une dominante verte (néons) ?", options: ["Température", "Teinte", "Exposition", "Vignette"], explanation: "La Teinte agit sur l'axe vert–magenta." },
    { kind: "studio", title: "Supprimer la dominante chaude", instructions: "La ville est toute orange : dans la parade, le rouge domine. Amenez la **Température** globale entre **−15** et **+15**.", goals: ["Température globale **−15…+15**"] },
    { kind: "match", title: "Associe", pairs: [["Bleu haut", "Dominante froide"], ["Rouge haut", "Dominante chaude"], ["Température", "Axe bleu–orange"], ["Teinte", "Axe vert–magenta"]] },
  ] },
  "istogramma": { title: "L'histogramme", summary: "La distribution des tons en un coup d'œil.", steps: [
    { kind: "theory", title: "Une montagne de pixels", body: ["L'**histogramme** compte combien de pixels existent à chaque niveau de luminosité : ombres à gauche, hautes lumières à droite.", "Une montagne **écrasée contre le bord gauche** signifie des **noirs bouchés** (perdus) ; contre le bord droit, des **blancs cramés**."] },
    { kind: "quiz", question: "L'histogramme est écrasé contre le bord gauche. Que se passe-t-il ?", options: ["Les ombres sont bouchées et le détail est perdu", "Les hautes lumières sont cramées", "Tout va bien", "Il y a trop d'audio"], explanation: "Les pixels sont entassés sur le noir absolu." },
    { kind: "theory", title: "Ouvrir les ombres", body: ["Le curseur **Ombres** de Lumetri relève les zones sombres sans toucher au reste : récupérer le détail dans les cheveux, les vêtements sombres, les coins."] },
    { kind: "quiz", question: "Quel curseur récupère le détail dans les zones sombres ?", options: ["Hautes lumières", "Ombres", "Saturation", "Teinte"], explanation: "Les Ombres agissent directement là-dessus." },
    { kind: "studio", title: "Récupérer les ombres", instructions: "Les ombres de l'interview sont bouchées. Amenez les **Ombres** globales à au moins **−10** (elles commencent à −80) sans monter l'exposition au-dessus de **+0.5**.", goals: ["Ombres ≥ **−10**", "Exposition ≤ **+0.5**"] },
  ] },
  "skin-line": { title: "La ligne de teint", summary: "Des peaux naturelles avec le vectorscope.", steps: [
    { kind: "theory", title: "Toutes les peaux sur une ligne", body: ["Dans le vectorscope, il y a une diagonale entre le rouge et le jaune : la **ligne de teint** (skin tone line). La peau humaine, **quelle que soit la couleur**, se situe près de cette ligne : la saturation change, pas la teinte.", "Si le visage dérive vers le **magenta** ou le **vert**, les gens ont l'air malades ou faux."] },
    { kind: "quiz", question: "Dans le vectorscope, les peaux de personnes de couleurs différentes…", options: ["Sont à l'opposé l'une de l'autre", "Se situent près de la même ligne, seule la distance au centre change", "Sont invisibles", "Sont toujours au centre"], explanation: "Même teinte, saturation différente." },
    { kind: "theory", title: "Isoler le visage", body: ["Pour vérifier uniquement la peau, les étalonneurs zooment sur le visage ou utilisent un masque, pour que le vectorscope ne montre que ces pixels."] },
    { kind: "quiz", question: "Le visage tire vers le vert. Que corrigez-vous ?", options: ["Teinte vers le magenta", "Température vers le bleu", "Volume", "Saturation à zéro"], explanation: "Le vert se compense avec le magenta sur l'axe de Teinte." },
    { kind: "studio", title: "Peau naturelle", instructions: "La peau de l'interviewé tire vers le **magenta** : la Teinte est à +50. Amenez la **Teinte** globale entre **−10** et **+10** et gardez la **Température** dans ±20.", goals: ["Teinte **−10…+10**", "Température dans **±20**"] },
  ] },
  "esposizione": { title: "L'exposition", summary: "Ramener les hautes lumières et les ombres dans la bonne plage.", steps: [
    { kind: "theory", title: "Le premier curseur", body: ["L'**Exposition** dans Lumetri monte ou baisse toute l'image en **stops** (comme sur la caméra) : +1 double la lumière, −1 la divise par deux.", "C'est la première étape de toute correction : la lumière d'abord, le reste ensuite."] },
    { kind: "quiz", question: "Exposition +1 dans Lumetri signifie…", options: ["Un peu plus lumineux", "Double la lumière (un stop)", "Plus de saturation", "Plus de contraste"], explanation: "Un stop = double la lumière." },
    { kind: "theory", title: "Hautes lumières et ombres séparément", body: ["Après l'exposition, affinez les **Hautes lumières** (zones claires) et les **Ombres** (zones sombres) pour récupérer du détail sans changer le reste."] },
    { kind: "quiz", question: "Le ciel est cramé mais le sujet est correct. Que baissez-vous ?", options: ["Hautes lumières", "Ombres", "Teinte", "Vibrance"], explanation: "Les Hautes lumières n'agissent que sur les zones claires." },
    { kind: "studio", title: "Trop sombre", instructions: "Le drone est sous-exposé de deux stops. Amenez l'**Exposition** globale entre **−0.3** et **+0.5**.", goals: ["Exposition **−0.3…+0.5**"] },
    { kind: "studio", title: "Trop lumineux", instructions: "Maintenant l'inverse : la ville est **surexposée**. Exposition entre **−0.3** et **+0.3** et **Hautes lumières** à **≤ 0**.", goals: ["Exposition **−0.3…+0.3**", "Hautes lumières ≤ **0**"] },
  ] },
  "contrasto": { title: "Le contraste", summary: "Ajouter de la profondeur sans cramer les détails.", steps: [
    { kind: "theory", title: "La profondeur", body: ["Le **Contraste** est l'écart entre les zones sombres et claires. Peu de contraste = image plate ; trop = ombres bouchées et hautes lumières cramées.", "Un bon contraste sépare le sujet du fond et ajoute de la **dimension**."] },
    { kind: "quiz", question: "Trop de contraste risque de…", options: ["Boucher les ombres et cramer les hautes lumières", "Baisser le volume", "Ralentir la vidéo", "Changer le format"], explanation: "Les extrêmes sont écrasés et le détail est perdu." },
    { kind: "theory", title: "Contraste avec contrôle", body: ["Montez le **Contraste** puis récupérez avec les **Hautes lumières** (vers le bas) et les **Ombres** (vers le haut) si les extrêmes sont perdus. Même idée qu'une **courbe en S**."] },
    { kind: "quiz", question: "Après avoir monté le contraste, le ciel est cramé. Que faites-vous ?", options: ["Baisser les Hautes lumières", "Monter la saturation", "Monter les Hautes lumières", "Rien"], explanation: "Les Hautes lumières récupèrent les zones claires." },
    { kind: "studio", title: "Ajouter de la profondeur", instructions: "Le coucher de soleil est plat. Amenez le **Contraste** global à au moins **+25**, mais gardez les **Hautes lumières** à **≤ +10** pour ne pas cramer le ciel.", goals: ["Contraste ≥ **+25**", "Hautes lumières ≤ **+10**"] },
  ] },
  "bilanciamento-bianco": { title: "La balance des blancs", summary: "Supprimer les dominantes chaudes ou froides.", steps: [
    { kind: "theory", title: "Le blanc doit être blanc", body: ["Chaque lumière a une **température de couleur** : une ampoule domestique est chaude (orange, ~3200 K), un ciel couvert est froid (bleu, ~6500 K et au-delà).", "Si la caméra n'était pas bien réglée, l'image a une **dominante**. La balance des blancs la supprime : ce qui était blanc redevient blanc."], terms: [{ term: "Kelvin (K)", def: "Unité de température de couleur" }, { term: "Pipette", def: "Cliquez sur une zone blanche et Lumetri balance automatiquement" }] },
    { kind: "quiz", question: "Un plan en intérieur avec des ampoules à incandescence tend à être…", options: ["Bleu", "Orange", "Vert", "Violet"], explanation: "La lumière tungstène est chaude." },
    { kind: "theory", title: "La pipette", body: ["Dans Lumetri, il y a la **pipette de balance des blancs** : cliquez sur quelque chose qui devrait être blanc ou gris et la Température et la Teinte s'ajustent automatiquement."] },
    { kind: "quiz", question: "Sur quoi cliquer avec la pipette de balance des blancs ?", options: ["Un visage", "Quelque chose qui devrait être blanc ou gris neutre", "Un ciel bleu", "Un objet rouge"], explanation: "Il faut une référence neutre." },
    { kind: "studio", title: "Réchauffer une image froide", instructions: "La mer est trop **bleue** (Température −60). Amenez la **Température** globale entre **−10** et **+10**.", goals: ["Température **−10…+10**"] },
  ] },
  "saturazione": { title: "Saturation et vibrance", summary: "Des couleurs vives mais crédibles.", steps: [
    { kind: "theory", title: "Deux curseurs différents", body: ["La **Saturation** monte **toutes** les couleurs de la même façon. La **Vibrance** monte principalement les couleurs **sous-saturées** et protège celles qui sont déjà fortes et les peaux.", "C'est pourquoi les étalonneurs préfèrent presque toujours la **Vibrance** : des couleurs plus riches sans visages oranges."] },
    { kind: "quiz", question: "Vous voulez des couleurs plus vives sans que les visages virent à l'orange. Que utilisez-vous ?", options: ["Saturation au maximum", "Vibrance", "Exposition", "Teinte"], explanation: "La Vibrance protège les peaux et les couleurs déjà saturées." },
    { kind: "theory", title: "Moins c'est plus", body: ["Une image sursaturée est fatigante et semble fausse. Souvent **+10/+20** de vibrance suffit."] },
    { kind: "quiz", question: "Quelle valeur de vibrance est raisonnable pour un rendu naturel ?", options: ["+15", "+100", "−100", "+500"], explanation: "De petits ajustements, une grande différence." },
    { kind: "studio", title: "Couleurs vives, visages naturels", instructions: "Rendez le café plus appétissant avec la **Vibrance** (au moins **+20**) mais gardez la **Saturation** globale à **≤ 120**.", goals: ["Vibrance ≥ **+20**", "Saturation ≤ **120**"] },
  ] },
  "match-clip": { title: "Raccorder deux clips", summary: "Faire que deux caméras semblent n'en faire qu'une.", steps: [
    { kind: "theory", title: "Une scène, une couleur", body: ["Deux caméras différentes (ou la même avec une lumière différente) donnent des couleurs différentes. Si vous alternez sans corriger, le spectateur **sent** le saut.", "Vous choisissez un clip de **référence** (le *hero shot*) et vous rapprochez les autres, en surveillant les scopes côte à côte."] },
    { kind: "quiz", question: "Quel est le clip de référence quand on raccorde les couleurs ?", options: ["Le plus court", "Celui vers lequel on aligne tous les autres", "Le dernier dans la timeline", "Un clip noir"], explanation: "Tous les autres sont amenés vers lui." },
    { kind: "theory", title: "Comparaison côte à côte", body: ["Lumetri a une **Vue comparée** : référence à gauche, clip à corriger à droite. Concentrez-vous surtout sur la **peau**, les **blancs** et les **noirs**."] },
    { kind: "quiz", question: "Que vérifiez-vous en premier pour raccorder deux plans d'interview ?", options: ["La peau et les neutres", "La durée", "Le volume", "Les noms de fichier"], explanation: "La peau et les neutres trahissent immédiatement les différences." },
    { kind: "studio", title: "Raccordez les deux plans", instructions: "Le premier clip (référence) est chaud, le second est neutre. Amenez le **second** clip à la même température que le premier (différence ≤ **10**).", goals: ["Températures raccordées (≤ 10 de différence)"] },
  ] },
  "lut": { title: "Looks et LUTs", summary: "Appliquer une LUT au bon endroit de la chaîne.", steps: [
    { kind: "theory", title: "Qu'est-ce qu'une LUT", body: ["Une **LUT** (Look-Up Table) est une table qui transforme chaque couleur en une autre. Il y a les LUT **techniques** (Log vers Rec.709) et les LUT **créatives** (un look : teal & orange, film…).", "Une LUT créative doit être appliquée **après** la correction : si l'image de départ est mauvaise, le look sera mauvais."] },
    { kind: "quiz", question: "Où se place une LUT créative dans la chaîne d'effets ?", options: ["Avant tout", "Après la correction primaire", "À la place de l'audio", "Ça n'a pas d'importance"], explanation: "D'abord corriger l'image, ensuite le look." },
    { kind: "theory", title: "Doser le look", body: ["Une LUT à 100 % est souvent trop forte. Dans Lumetri vous pouvez baisser son **intensité**, ou la mettre sur un **calque d'ajustement** avec une opacité réduite."] },
    { kind: "quiz", question: "La LUT est trop forte. Comment l'adoucir ?", options: ["Baisser l'intensité ou l'opacité du calque d'ajustement", "Exporter en 720p", "Monter le volume", "Impossible"], explanation: "Dosez-la comme un ingrédient." },
    { kind: "studio", title: "Correction, puis look", instructions: "Le coucher de soleil a déjà une correction Lumetri. Ajoutez **après** un effet **Apply Color LUT** avec le look **Warm Film**.", goals: ["LUT **Warm Film**", "Après Lumetri"] },
    { kind: "studio", title: "Un look pour toute la séquence", instructions: "Appliquez le look à **tous** les clips en même temps : créez un **Calque d'ajustement** (Fichier → Nouveau), placez-le sur **V2** au-dessus des clips et appliquez la LUT **Cinematic teal & orange**.", goals: ["Calque d'ajustement sur V2", "…avec la LUT teal & orange", "Couvre les deux clips"] },
  ] },
  "curve": { title: "Les courbes", summary: "L'outil le plus puissant de l'étalonneur.", steps: [
    { kind: "theory", title: "La courbe de tons", body: ["La **courbe** met en relation l'entrée (horizontal) et la sortie (vertical) sur un graphique. Une ligne droite ne change rien ; déplacer des points ajuste les ombres, les tons moyens et les hautes lumières avec précision.", "La classique **courbe en S** baisse légèrement les ombres et relève légèrement les hautes lumières : plus de contraste, mais en douceur."] },
    { kind: "quiz", question: "Quel effet produit une courbe en S ?", options: ["Contraste en douceur", "Noir et blanc", "Moins de lumière partout", "Inverse les couleurs"], explanation: "Ombres vers le bas, hautes lumières vers le haut : contraste maîtrisé." },
    { kind: "theory", title: "Point noir et point blanc", body: ["Les extrémités de la courbe sont le **point noir** et le **point blanc**. Les rapprocher vers l'intérieur « étire » l'image : exactement ce que fait l'effet **Levels** avec *Input Black* et *Input White*."], tip: "Dans le simulateur, nous utilisons Levels : même principe que les deux extrémités de la courbe." },
    { kind: "quiz", question: "Monter l'Input Black dans Levels de 0 à 15 rend…", options: ["Les gris foncés deviennent noirs : plus de contraste dans les ombres", "L'image devient blanche", "Le volume augmente", "Rien"], explanation: "Tout ce qui est en dessous de 15 devient du noir pur." },
    { kind: "studio", title: "Étirez les tons", instructions: "Le café est grisâtre. Avec **Levels**, amenez l'**Input Black** à au moins **12** et l'**Input White** à **≤ 240** : des noirs plus noirs, des blancs plus blancs.", goals: ["Input Black ≥ **12**", "Input White ≤ **240**"] },
  ] },
  "hsl": { title: "Correction secondaire HSL", summary: "Isoler et modifier une seule couleur.", steps: [
    { kind: "theory", title: "Primaire et secondaire", body: ["La correction **primaire** affecte toute l'image. La **secondaire** isole une partie : une couleur (avec HSL), une zone (avec un masque) ou les deux.", "Avec le **HSL secondaire** de Lumetri, vous sélectionnez une couleur (ex. le vert de l'herbe) et changez sa teinte, sa saturation et sa luminance sans toucher au reste."], terms: [{ term: "H", def: "Teinte (Hue)" }, { term: "S", def: "Saturation" }, { term: "L", def: "Luminance" }] },
    { kind: "quiz", question: "Vous voulez rendre uniquement le ciel plus bleu sans toucher les visages. Qu'utilisez-vous ?", options: ["Correction primaire", "HSL secondaire", "Exposition", "Volume"], explanation: "Le secondaire isole une seule couleur." },
    { kind: "theory", title: "Rotation de la teinte", body: ["**Color Balance (HLS)** fait pivoter la **teinte** de toute l'image d'un certain angle : +30° décale les rouges vers l'orange, les verts vers le cyan… Utile pour comprendre le fonctionnement de la roue chromatique."] },
    { kind: "quiz", question: "Pivoter la teinte de 180° transforme le bleu en…", options: ["Orange/jaune", "Bleu plus foncé", "Gris", "Vert"], explanation: "Sur la roue chromatique, l'opposé du bleu est l'orange." },
    { kind: "studio", title: "Faites tourner la roue chromatique", instructions: "Appliquez **Color Balance (HLS)** au drone et faites pivoter la **Teinte** d'au moins **30°** (dans un sens ou l'autre) pour transformer la mer en couleur fantaisie.", goals: ["Teinte pivotée de ≥ **30°**"] },
  ] },
  "maschere-colore": { title: "Masques et suivi", summary: "Corriger uniquement une zone de l'image.", steps: [
    { kind: "theory", title: "Corriger une zone", body: ["Avec un **masque**, vous limitez un effet à une zone : éclaircir seulement le visage, assombrir seulement le ciel, flouter une plaque d'immatriculation.", "Un masque **progressif** (feather élevé) rend la correction invisible : la transition est graduelle."] },
    { kind: "quiz", question: "Pourquoi adoucir le bord d'un masque de correction ?", options: ["Pour le rendre invisible avec une transition graduelle", "Pour un export plus rapide", "Pour changer le format", "Jamais d'adoucissement"], explanation: "Un bord net serait immédiatement visible." },
    { kind: "theory", title: "Le suivi (tracking)", body: ["Si le sujet bouge, le masque doit **suivre** : le **tracking** analyse le mouvement image par image et déplace le masque automatiquement."] },
    { kind: "quiz", question: "Le visage que vous voulez éclaircir bouge dans le plan. Que vous faut-il ?", options: ["Le suivi du masque (tracking)", "Une autre séquence", "La règle des 180°", "Un arrêt sur image"], explanation: "Le tracking fait suivre le sujet par le masque." },
    { kind: "studio", title: "Une lumière sur le sujet uniquement", instructions: "Dans After Effects : il y a un **calque d'ajustement** au-dessus de la vidéo. Dessinez un **masque elliptique** dessus (outil Ellipse, **Q**), adoucissez-le (**Mask Feather** ≥ **40**) et appliquez **Lumetri Color** avec une **Exposition** ≥ **+0.5**.", hint: "Sélectionnez le calque d'ajustement, choisissez l'outil **Ellipse** et tracez dans le panneau Composition. Appuyez sur **F** pour voir le Mask Feather.", goals: ["Masque sur le calque d'ajustement", "Feather ≥ **40**", "Lumetri avec Exposition ≥ **+0.5**"] },
  ] },
  "creare-look": { title: "Créer un look", summary: "Teal & orange, vintage, noir et blanc.", steps: [
    { kind: "theory", title: "Les looks les plus célèbres", body: ["**Teal & orange** : ombres vers le sarcelle, peau et hautes lumières vers l'orange. C'est le look blockbuster : sépare les personnages du décor.", "**Vintage** : noirs relevés (jamais du noir pur), couleurs désaturées, une touche de grain et une dominante chaude. **Noir et blanc** : tout est dans le contraste."] },
    { kind: "quiz", question: "Pourquoi le teal & orange fonctionne-t-il si bien ?", options: ["Parce que la peau (orange) ressort sur sa complémentaire (sarcelle)", "Parce que c'est plus léger", "Parce que c'est du noir et blanc", "Par hasard"], explanation: "Couleurs complémentaires = séparation maximale." },
    { kind: "theory", title: "Le vignettage", body: ["Un **vignettage** subtil assombrit les bords et attire le regard vers le centre. Dans Lumetri, les valeurs **négatives** assombrissent les coins."] },
    { kind: "quiz", question: "À quoi sert un vignettage subtil ?", options: ["Guider le regard vers le centre", "Monter le volume", "Stabiliser", "Sous-titrer"], explanation: "Bords plus sombres, le centre prend la vedette." },
    { kind: "studio", title: "Look cinéma", instructions: "Créez un look cinéma sur la ville : LUT **Cinematic teal & orange**, **Contraste** global ≥ **+15** et **Vignette** ≤ **−0.5**.", goals: ["LUT teal & orange", "Contraste ≥ **+15**", "Vignette ≤ **−0.5**"] },
    { kind: "studio", title: "Noir et blanc d'auteur", instructions: "Transformez l'interview en **noir et blanc** à fort contraste : effet **Black & White** (ou Saturation 0) et **Contraste** ≥ **+25**.", goals: ["En **noir et blanc**", "Contraste ≥ **+25**"] },
  ] },

  // Section 4
  "composizioni": { title: "Les compositions", summary: "Le conteneur de chaque animation.", steps: [
    { kind: "theory", title: "La composition", body: ["Dans After Effects, tout vit à l'intérieur d'une **composition** (comp) : elle a des dimensions, une fréquence d'images, une **durée** et une couleur de fond, comme une séquence Premiere.", "Créez-en une avec **Composition → Nouvelle composition** (**Ctrl+N**). À l'intérieur se trouvent les **calques**, empilés : celui du dessus recouvre ceux du dessous."] },
    { kind: "quiz", question: "Quelle est la différence principale entre une séquence Premiere et une composition After Effects ?", options: ["Aucune", "La comp a une durée fixe définie à la création", "La comp n'a pas de dimensions", "La comp ne peut pas contenir de vidéo"], explanation: "Dans AE, vous définissez la durée à l'avance ; dans Premiere, la séquence s'allonge toute seule." },
    { kind: "theory", title: "Les bons réglages", body: ["Pour les réseaux sociaux : **1080×1920** ou **1080×1080**. Pour YouTube : **1920×1080**. La **durée** est à prévoir un peu plus longue que nécessaire : vous pouvez raccourcir ensuite avec la **zone de travail**."] },
    { kind: "quiz", question: "Comment créer une nouvelle composition ?", options: ["Ctrl+N", "Ctrl+K", "Ctrl+M", "Ctrl+D"], explanation: "Comme dans Premiere, N pour Nouveau." },
    { kind: "studio", title: "Votre première composition", instructions: "Créez une composition appelée **Intro**, **1920×1080**, **30 fps**, durée **10 secondes** (Composition → Nouvelle composition).", goals: ["Comp **1920×1080**", "À **30 fps**", "Dure **10 s**", "Nommée **Intro**"] },
    { kind: "studio", title: "Remplissez-la", instructions: "Ajoutez un fond à la composition : **Calque → Nouveau → Solide** (**Ctrl+Y**) et un **texte** avec l'outil Texte (**Ctrl+T**).", hint: "Dans la timeline AE, le calque du **dessus** est celui devant : glissez vers le haut ou le bas pour changer l'ordre.", goals: ["Un **solide**", "Un calque **texte**", "Le texte est **au-dessus** du fond"] },
  ] },
  "livelli": { title: "Calques et précompositions", summary: "Organiser les projets complexes.", steps: [
    { kind: "theory", title: "Différents types de calques", body: ["**Solide** (une couleur), **texte**, **forme**, **métrage** (vidéo, images), **calque d'ajustement** (applique des effets à tout ce qui est en dessous), **objet nul** (invisible, sert à contrôler d'autres calques)."] },
    { kind: "quiz", question: "Quel calque est invisible et sert à contrôler d'autres calques ?", options: ["Solide", "Objet nul", "Texte", "Forme"], explanation: "Le nul n'est pas rendu : c'est une poignée." },
    { kind: "theory", title: "Précomposer", body: ["Quand les calques s'accumulent, regroupez-les dans une **précomposition** (**Ctrl+Shift+C**) : ils deviennent un seul calque contenant une comp. Comme un dossier qui s'anime comme un tout."] },
    { kind: "quiz", question: "Quel raccourci précompose les calques sélectionnés ?", options: ["Ctrl+Shift+C", "Ctrl+D", "Ctrl+K", "Alt+P"], explanation: "C pour Compose : Ctrl+Shift+C." },
    { kind: "studio", title: "Grouper le titre", instructions: "Sélectionnez le texte **SQUEAK** et la forme **Bar** et **précomposez**-les (Ctrl+Shift+C). Dans la comp principale, un calque **composition** doit les remplacer.", goals: ["Un calque **précomposition** existe", "Le texte est dans la précomp"] },
    { kind: "studio", title: "Un nul de contrôle", instructions: "Ajoutez un **objet nul** (Calque → Nouveau → Objet nul) et renommez-le **Control** (Entrée sur le nom).", goals: ["Un **objet nul**", "Nommé **Control**"] },
  ] },
  "forme": { title: "Les calques de forme", summary: "Dessiner et animer des formes vectorielles.", steps: [
    { kind: "theory", title: "Formes vectorielles", body: ["Les **calques de forme** se dessinent avec les outils Rectangle, Ellipse, Étoile (**Q** pour alterner). Ils sont **vectoriels** : agrandissez-les autant que vous voulez sans perte de qualité.", "Chaque forme a un **Remplissage**, un **Contour** et des propriétés animables comme la **Taille**."] },
    { kind: "quiz", question: "Pourquoi les formes vectorielles ne perdent-elles pas en qualité à l'agrandissement ?", options: ["Elles sont dessinées avec des formules, pas des pixels", "Elles sont en 4K", "Elles sont en noir et blanc", "Ce n'est pas vrai"], explanation: "Le vectoriel recalcule à chaque taille." },
    { kind: "theory", title: "L'animation « pop »", body: ["L'entrée la plus utilisée en motion graphics est le **pop** : la forme commence à **0** et grandit jusqu'à sa taille, souvent avec un petit **rebond** (dépasse puis revient)."] },
    { kind: "quiz", question: "Une animation « pop » commence à une taille de…", options: ["0", "100", "1000", "−50"], explanation: "De rien à la taille finale : elle apparaît en grandissant." },
    { kind: "studio", title: "Dessinez une étoile", instructions: "Dessinez une **étoile** avec l'outil Étoile (**Q** jusqu'à le trouver) dans le panneau Composition.", goals: ["Un calque **forme étoile**"] },
    { kind: "studio", title: "Faites-la exploser (pop)", instructions: "Animez la **Taille** de la forme **Cheese** : keyframe à **0** puis à taille pleine (au moins 200), avec **Easy Ease**.", goals: ["Au moins 2 keyframes de **Taille**", "Commence à ~0 et atteint ≥ 200", "Avec **Easy Ease**"] },
  ] },
  "maschere-matte": { title: "Masques et track matte", summary: "N'afficher qu'une partie d'un calque.", steps: [
    { kind: "theory", title: "Les masques", body: ["Un **masque** est un tracé dessiné sur un calque : seul l'intérieur reste visible. Avec le **Feather**, le bord devient doux ; avec l'**Expansion**, le masque grandit ou rétrécit.", "Animer l'expansion crée un **reveal** : l'image s'ouvre depuis le centre."] },
    { kind: "quiz", question: "Quelle propriété du masque adoucit le bord ?", options: ["Feather", "Opacité", "Expansion", "Rotation"], explanation: "Le Feather adoucit le contour." },
    { kind: "theory", title: "Le track matte", body: ["Un **track matte** utilise un calque (ex. du texte) comme masque pour celui du dessous : la vidéo s'affiche **à l'intérieur des lettres**. C'est l'effet « titres remplis d'image »."] },
    { kind: "quiz", question: "Vous voulez que la vidéo s'affiche à l'intérieur des lettres d'un titre. Qu'utilisez-vous ?", options: ["Un track matte", "Un arrêt sur image", "Un nul", "Une expression"], explanation: "Le texte sert de fenêtre sur la vidéo." },
    { kind: "studio", title: "Effet projecteur", instructions: "Sur le drone, dessinez un **masque elliptique** (outil Ellipse avec le calque sélectionné) et adoucissez-le avec **Mask Feather** ≥ **60**.", goals: ["Un **masque elliptique**", "Feather ≥ **60**"] },
    { kind: "studio", title: "Reveal", instructions: "Maintenant, animez l'**Expansion du masque** du drone : de très négatif (≤ **−200**, masque fermé) à **0** ou plus, pour que l'image s'ouvre.", goals: ["Au moins 2 keyframes d'**Expansion**", "De fermé (≤ −200) à ouvert (≥ 0)"] },
  ] },
  "parenting": { title: "Le parentage", summary: "Lier des calques qui bougent ensemble.", steps: [
    { kind: "theory", title: "Parent et enfant", body: ["Avec le **parentage**, un calque (enfant) suit tous les mouvements d'un autre (parent) : position, échelle, rotation. L'enfant peut aussi avoir ses propres mouvements.", "Ça se fait via la colonne **Parent** dans la timeline : menu déroulant ou le **pick whip** glissé vers le parent."] },
    { kind: "quiz", question: "Si vous faites pivoter le parent, que fait l'enfant ?", options: ["Reste immobile", "Pivote avec le parent", "Disparaît", "Se duplique"], explanation: "L'enfant hérite des transformations du parent." },
    { kind: "theory", title: "Le nul comme marionnettiste", body: ["Astuce pro : liez plusieurs calques à un **objet nul** et n'animez que le nul. Déplacez, pivotez ou redimensionnez tout le groupe avec un seul jeu de keyframes."] },
    { kind: "quiz", question: "Vous voulez déplacer le logo, le texte et la barre ensemble. Que faites-vous ?", options: ["Les lier à un nul et animer le nul", "Animer chacun séparément", "Les exporter", "Utiliser une transition"], explanation: "Un seul contrôle pour tout le groupe." },
    { kind: "studio", title: "Le bras suit le corps", instructions: "Le **Body** bouge déjà. Liez le **Arm** au Body comme **parent** (colonne Parent).", goals: ["Arm → parent **Body**"] },
    { kind: "studio", title: "Le marionnettiste", instructions: "Créez un **objet nul**, liez **le logo et le texte** au nul et animez la **Rotation** du nul (au moins 2 keyframes).", goals: ["Un **objet nul**", "Logo et texte sont enfants du nul", "Le nul tourne (2 keyframes)"] },
  ] },
  "animatori-testo": { title: "Les animateurs de texte", summary: "Animer lettre par lettre.", steps: [
    { kind: "theory", title: "Animer le texte de l'intérieur", body: ["Les **animateurs de texte** modifient des propriétés (opacité, position, tracking…) **lettre par lettre** à l'aide d'un **sélecteur de plage** qui décide quelles lettres sont affectées.", "Animer le **End** du sélecteur de 0 % à 100 % fait apparaître les lettres une par une ; animer le **Tracking** fait « s'ouvrir » le titre."] },
    { kind: "quiz", question: "Que décide le sélecteur de plage ?", options: ["Quelles lettres sont animées", "La couleur du texte", "La durée de la comp", "La police"], explanation: "Start, End et Offset choisissent les lettres." },
    { kind: "theory", title: "Le tracking d'ouverture", body: ["Un classique des bandes-annonces : le titre apparaît avec des lettres **serrées** et **s'élargit** lentement. Animez le **Tracking** depuis l'animateur."] },
    { kind: "quiz", question: "Quelle propriété animer pour un titre « respirant » façon bande-annonce ?", options: ["Tracking", "Opacité du calque", "Volume", "Durée"], explanation: "Les lettres s'espacent lentement." },
    { kind: "studio", title: "Titre de bande-annonce", instructions: "Ouvrez l'**Animateur 1** sur le texte et animez le **Tracking** : de **0** à au moins **200** en 2 à 4 secondes.", goals: ["Au moins 2 keyframes de **Tracking**", "De ~0 à au moins **200**"] },
    { kind: "studio", title: "Lettre par lettre", instructions: "Maintenant, faites apparaître le texte lettre par lettre : animez le **Range Selector: End** de **0 %** à **100 %**.", goals: ["End de **0 %**", "…à **100 %**"] },
  ] },
  "titoli-cinetici": { title: "La typographie cinétique", summary: "Des mots qui suivent la voix.", steps: [
    { kind: "theory", title: "Des mots qui bougent", body: ["La **typographie cinétique** fait apparaître les mots **en rythme avec la voix** : chaque mot entre quand il est prononcé, avec des tailles et des mouvements différents pour l'emphase.", "Les mots importants sont **plus grands** et restent plus longtemps ; les mots de liaison sont plus petits et plus rapides."] },
    { kind: "quiz", question: "En typographie cinétique, comment souligner un mot-clé ?", options: ["Plus grand avec plus de temps à l'écran", "Plus petit et plus rapide", "En le cachant", "En gris"], explanation: "Hiérarchie visuelle = hiérarchie de sens." },
    { kind: "theory", title: "Le décalage", body: ["Les entrées doivent être **décalées** : le deuxième mot démarre quelques images après le premier. Dans AE, décalez simplement les calques dans le temps, ou utilisez **Animation → Keyframe Assistant → Sequence Layers**."] },
    { kind: "quiz", question: "Que signifie décaler les animations ?", options: ["Les démarrer les unes après les autres", "Les démarrer toutes en même temps", "Les supprimer", "Les exporter"], explanation: "Un petit décalage entre les éléments crée du rythme." },
    { kind: "studio", title: "Trois mots, trois temps", instructions: "Faites entrer les trois mots **APPRENDS**, **À** et **MONTER** avec un **pop d'Échelle** (de 0 à 100), les uns **après les autres** : les premiers keyframes doivent démarrer à des moments différents (au moins 0.2 s d'écart).", goals: ["Les 3 mots ont un **pop d'Échelle**", "Entrées **décalées**"] },
  ] },
  "typewriter": { title: "L'effet machine à écrire", summary: "Du texte qui apparaît caractère par caractère.", steps: [
    { kind: "theory", title: "Une lettre à la fois", body: ["L'effet **machine à écrire** (typewriter) fait apparaître le texte **un caractère à la fois**, comme si quelqu'un le tapait. Parfait pour les messages, les dates, les lieux.", "Dans AE, vous animez le **range selector End** de 0 % à 100 % (ou utilisez le preset *Typewriter*)."] },
    { kind: "quiz", question: "Quelle propriété anime-t-on pour l'effet typewriter ?", options: ["Range selector End", "Échelle du calque", "Couleur de fond", "Durée de la comp"], explanation: "De 0 % à 100 % : les lettres apparaissent les unes après les autres." },
    { kind: "theory", title: "Avec des expressions", body: ["Au lieu de keyframes, vous pouvez écrire une **expression** sur la propriété (Alt+clic sur le chronomètre) : par exemple **linear(time, 0, 2, 0, 100)** fait passer la valeur de 0 à 100 dans les 2 premières secondes."] },
    { kind: "quiz", question: "Que fait l'expression linear(time, 0, 2, 0, 100) ?", options: ["Va de 0 à 100 dans les 2 premières secondes", "Boucle indéfiniment", "Génère des nombres aléatoires", "Rien"], explanation: "Convertit le temps 0–2 s en la plage 0–100." },
    { kind: "studio", title: "Tapez le message", instructions: "Faites apparaître **Bonjour, je suis Squeak !** façon machine à écrire : **Range End** de **0** à **100 %** en au moins **1.5 seconde**.", goals: ["Commence à **0 %**", "Atteint **100 %**", "Dure au moins **1.5 s**"] },
    { kind: "studio", title: "Avec une expression", instructions: "Refaites-le **sans keyframes** : Alt+clic sur le chronomètre de **Range End** et écrivez une expression avec **linear** et **time** (ex. **linear(time, 0, 2, 0, 100)**).", goals: ["Expression avec **linear** et **time**"] },
  ] },
  "lower-third-animato": { title: "Bandeau-titre animé", summary: "Entrée et sortie en douceur.", steps: [
    { kind: "theory", title: "Comment un bandeau-titre entre", body: ["Un bandeau-titre animé a généralement **deux parties** : une **barre** (forme) qui glisse et un **texte** qui apparaît juste après. À la sortie, l'ordre s'inverse.", "Les entrées durent **10 à 20 images** et utilisent toujours de l'**easing** : rapide au départ, doux à l'arrivée."] },
    { kind: "quiz", question: "Combien de temps dure l'entrée d'un bandeau-titre ?", options: ["10 à 20 images", "5 secondes", "1 image", "1 minute"], explanation: "Court et vif, mais doux à l'arrivée." },
    { kind: "theory", title: "Ordre et rythme", body: ["La barre d'abord, puis le texte (même juste 4 à 6 images plus tard) : l'œil suit le mouvement et arrive prêt à lire."] },
    { kind: "quiz", question: "À la sortie, qu'est-ce qui disparaît en premier ?", options: ["Le texte, puis la barre", "La barre, puis le texte", "Tout en même temps toujours", "Rien"], explanation: "Inversez l'ordre d'entrée." },
    { kind: "studio", title: "La barre entre", instructions: "Faites **glisser la barre** depuis la gauche : deux keyframes de **Position** avec au moins **600 px** de mouvement en X et **Easy Ease**.", goals: ["2 keyframes de Position sur **Bar**", "Mouvement ≥ **600 px** en X", "Avec **Easy Ease**"] },
    { kind: "studio", title: "Puis le texte", instructions: "Complétez : le **texte** apparaît avec une **Opacité** de 0 à 100 **après** que la barre a commencé à bouger (premier keyframe au moins 0.1 s après celui de la barre).", goals: ["Le texte a un fondu (0 → 100)", "Commence après la barre"] },
  ] },
  "logo-animato": { title: "Logo animé", summary: "Un intro de 3 secondes pour votre chaîne.", steps: [
    { kind: "theory", title: "Court et reconnaissable", body: ["Un intro de chaîne dure **2 à 4 secondes** : plus long et les gens sautent. Le logo entre avec un mouvement clair, fait une pause, et la vidéo commence.", "Un **rebond** (overshoot) ajoute du caractère : le logo grossit au-delà de la taille finale (110 %) et revient à 100 %."] },
    { kind: "quiz", question: "Combien de temps doit durer un intro de chaîne ?", options: ["2 à 4 secondes", "30 secondes", "1 minute", "Le plus longtemps possible"], explanation: "Court : le spectateur est là pour le contenu." },
    { kind: "theory", title: "Lumière et son", body: ["Un **glow** subtil, un flash ou un reflet, et surtout un **son** (whoosh, impact) rendent l'intro mémorable."] },
    { kind: "quiz", question: "Qu'est-ce que l'overshoot ?", options: ["Dépasser la valeur finale et revenir", "Exporter deux fois", "Une erreur de rendu", "Un codec"], explanation: "Le rebond qui donne vie aux mouvements." },
    { kind: "studio", title: "Pop avec rebond", instructions: "Animez l'**Échelle** du logo avec **3 keyframes** : **0** → au-delà de **105** → environ **100** (le rebond).", goals: ["Au moins **3 keyframes d'Échelle**", "Commence à ~0", "Dépasse **105** et finit à ~**100**"] },
    { kind: "studio", title: "Ajoutez le glow", instructions: "Rendez le logo lumineux : appliquez l'effet **Glow** (Stylize) et amenez le **Glow Radius** à au moins **30**.", goals: ["**Glow** avec radius ≥ 30"] },
  ] },
  "green-screen": { title: "Le fond vert", summary: "Incrustation avec le chroma key.", steps: [
    { kind: "theory", title: "Chroma key", body: ["On filme le sujet devant un fond **vert** (ou bleu), éclairé uniformément. Le **chroma key** rend cette couleur transparente et on place un autre décor derrière.", "Le vert est utilisé parce qu'il est éloigné des tons de peau et les capteurs sont très sensibles au vert."] },
    { kind: "quiz", question: "Pourquoi le fond est-il vert ?", options: ["Parce qu'il est éloigné des tons de peau", "Parce que les réalisateurs l'aiment bien", "Parce que c'est moins cher", "Par hasard"], explanation: "Pour que l'incrustation ne « mange » pas le sujet." },
    { kind: "theory", title: "Affiner l'incrustation", body: ["Après avoir choisi la couleur clé, vous ajustez la **tolérance** et la **douceur** et supprimez le **spill** (reflet vert sur les bords du sujet)."] },
    { kind: "quiz", question: "Qu'est-ce que le spill ?", options: ["Le reflet vert sur le sujet", "Un type de transition", "Une erreur audio", "La durée de l'incrustation"], explanation: "Le fond coloré se reflète sur les bords : il faut le neutraliser." },
    { kind: "studio", title: "Incrustez Squeak", instructions: "Le calque **Greenscreen_Squeak** est au-dessus du drone. Appliquez **Ultra Key** (Keying) pour supprimer le vert, avec la **Suppression du spill** activée.", goals: ["**Ultra Key** sur fond vert", "Suppression du spill activée"] },
    { kind: "studio", title: "Placez-le dans la scène", instructions: "Réduisez Squeak (Échelle ≤ **70**) et déplacez-le dans la **moitié droite** de la scène (X > 960).", goals: ["Échelle ≤ **70**", "À droite"] },
  ] },
  "tracking": { title: "Le suivi de mouvement", summary: "Attacher un élément à un objet en mouvement.", steps: [
    { kind: "theory", title: "Suivre le mouvement", body: ["Le **suivi de mouvement** (motion tracking) analyse un point dans l'image image par image et en extrait des keyframes de **position**. Puis vous « attachez » un texte, un logo ou un effet à ces données.", "Dans AE, vous appliquez les données à un **objet nul**, et vous parentez les éléments au nul."] },
    { kind: "quiz", question: "À quoi applique-t-on généralement les données de tracking ?", options: ["Un objet nul", "Directement à l'audio", "À la comp", "Au panneau Projet"], explanation: "Le nul devient le point qui bouge avec l'objet." },
    { kind: "theory", title: "Tracking manuel", body: ["Quand le tracking automatique échoue, faites-le manuellement : des keyframes de position sur le nul toutes les quelques images, en suivant l'objet. Lent, mais ça marche toujours."] },
    { kind: "quiz", question: "Après le tracking, comment attacher du texte au nul ?", options: ["Avec le parentage", "Avec une transition", "En copiant le fichier", "Impossible"], explanation: "Le texte devient enfant du nul et le suit." },
    { kind: "studio", title: "Tracking manuel", instructions: "Créez un **objet nul**, donnez-lui au moins **3 keyframes de Position** (un par seconde) et parentez le **texte** au nul.", goals: ["Nul avec **3+ keyframes de Position**", "Le texte suit le nul"] },
    { kind: "studio", title: "Lier avec une expression", instructions: "Alternative au parentage : écrivez sur la **Position** du texte une expression qui lit la position du nul, ex. **thisComp.layer(\"Target\").transform.position**.", goals: ["Expression qui lit **Target**"] },
  ] },
  "stabilizzazione": { title: "La stabilisation", summary: "Supprimer les tremblements de la prise à main levée.", steps: [
    { kind: "theory", title: "Le tremblement", body: ["Les images tournées **à main levée** tremblent. Le **Warp Stabilizer** analyse le clip et compense le mouvement, puis **agrandit** légèrement l'image pour masquer les bords mobiles.", "Plus vous demandez de **lissage**, plus l'image est recadrée (et perd en qualité)."] },
    { kind: "quiz", question: "Pourquoi le stabilisateur agrandit-il l'image ?", options: ["Pour masquer les bords qui bougent", "Pour augmenter la résolution", "Pour changer le format", "Il ne le fait pas"], explanation: "Compenser le mouvement laisse des zones vides sur les bords." },
    { kind: "theory", title: "Ne pas en abuser", body: ["**20 à 50 %** de lissage suffit généralement. À 100 %, le plan a l'air « caoutchouteux » et très recadré. Si le plan est trop tremblant, mieux vaut en choisir un autre."] },
    { kind: "quiz", question: "Quel niveau de lissage est généralement raisonnable ?", options: ["20 à 50 %", "Toujours 100 %", "0 %", "500 %"], explanation: "Assez pour supprimer le tremblement sans déformer." },
    { kind: "studio", title: "Stabilisez dans Premiere", instructions: "Le plan de ville tremble. Appliquez **Warp Stabilizer** (Effets vidéo → Déformation) avec un **Lissage** entre **20** et **50 %**.", goals: ["**Warp Stabilizer** appliqué", "Lissage **20–50 %**"] },
  ] },
  "blending": { title: "Les modes de fusion", summary: "Screen, Multiply et Overlay.", steps: [
    { kind: "theory", title: "Comment les calques se mélangent", body: ["Le **mode de fusion** décide comment un calque se mélange avec ceux du dessous. **Screen** (Écran) ne garde que les parties claires : parfait pour les lumières, les flammes, les reflets sur fond noir.", "**Multiply** (Produit) garde les parties sombres (ombres, textures sur fond blanc). **Overlay** (Incrustation) augmente le contraste en combinant les deux."] },
    { kind: "quiz", question: "Vous avez une explosion sur fond noir. Quel mode supprime le noir ?", options: ["Screen", "Multiply", "Normal", "Difference"], explanation: "Screen élimine le noir et garde la lumière." },
    { kind: "theory", title: "Où le changer", body: ["Dans AE, la colonne **Mode** dans la timeline (appuyez sur **F4** si vous ne la voyez pas). Dans Premiere : **Effets → Opacité → Mode de fusion**."] },
    { kind: "quiz", question: "Une texture papier sur fond blanc : quel mode pour ne garder que les parties sombres ?", options: ["Multiply", "Screen", "Add", "Normal"], explanation: "Multiply élimine le blanc." },
    { kind: "studio", title: "Lumière chaude sur la mer", instructions: "Le calque **Light** (orange) recouvre le drone. Passez-le en mode **Screen** (ou **Add**) et baissez son **Opacité** à **≤ 60 %**.", goals: ["Mode **Screen** ou **Add**", "Opacité ≤ **60 %**"] },
    { kind: "studio", title: "Texte incrusté", instructions: "Mettez le texte **WAVE** en mode **Overlay** au-dessus du drone : il aura l'air de faire partie de l'image.", goals: ["Texte en **Overlay**"] },
  ] },
  "particelle": { title: "Les particules", summary: "Poussière, étincelles et neige.", steps: [
    { kind: "theory", title: "Systèmes de particules", body: ["Un **système de particules** génère des centaines de petits éléments (points, étincelles, flocons) avec des règles : combien naissent, combien de temps ils vivent, où ils vont, combien ils pèsent.", "Dans AE, il y a **CC Particle World** (intégré) et des plugins comme **Trapcode Particular**. Utilisé pour la neige, la poussière, les étincelles, la magie."] },
    { kind: "quiz", question: "Qu'est-ce qui contrôle la « vie » d'une particule ?", options: ["Combien de temps elle reste visible avant de disparaître", "Sa couleur", "Le format de la comp", "Le volume"], explanation: "Chaque particule naît, vit et disparaît." },
    { kind: "theory", title: "Particules faites main", body: ["Pour quelques éléments, vous pouvez le faire manuellement : quelques petites formes, dupliquées (**Ctrl+D**), avec une expression **wiggle** sur la position pour les faire flotter aléatoirement.", "**wiggle(1, 50)** : une fois par seconde, bouge aléatoirement jusqu'à 50 pixels."] },
    { kind: "quiz", question: "Que fait l'expression wiggle(2, 30) ?", options: ["Bouge aléatoirement 2 fois par seconde jusqu'à 30 px", "Tourne de 30°", "Double l'échelle", "Arrête le calque"], explanation: "Fréquence 2, amplitude 30." },
    { kind: "studio", title: "Flocons de neige", instructions: "Créez au moins **5** petites formes (dupliquez le **Flake** avec **Ctrl+D**) et écrivez une expression **wiggle** sur la **Position** d'au moins **3** d'entre elles.", hint: "Écrivez l'expression sur le premier flocon **avant** de dupliquer : les copies en héritent !", goals: ["Au moins **5** formes", "**3+** avec wiggle sur Position"] },
  ] },

  // Section 5
  "proxy": { title: "Les proxies", summary: "Monter en 4K sur n'importe quel ordinateur portable.", steps: [
    { kind: "theory", title: "Des fichiers légers pour le montage", body: ["Les **proxies** sont des copies **légères** (basse résolution, codec simple) des fichiers lourds originaux. Vous montez avec les proxies, l'ordinateur ne rame pas, et à l'export Premiere utilise automatiquement les **originaux**.", "Dans Premiere : clic droit sur les clips → **Proxy → Créer des proxies**, puis le bouton **Toggle Proxies** dans le moniteur."] },
    { kind: "quiz", question: "À l'export, Premiere utilise…", options: ["Les proxies", "Les fichiers originaux", "Un fichier au hasard", "Aucun des deux"], explanation: "Les proxies ne servent qu'au confort du montage." },
    { kind: "theory", title: "Organiser proxies et originaux", body: ["Gardez les proxies et les originaux dans des **dossiers séparés** sur le disque avec les **mêmes noms** : ils se reconnecteront sans problème."], tip: "Une alternative rapide : baisser la résolution de lecture du Program Monitor à 1/2 ou 1/4." },
    { kind: "quiz", question: "Pourquoi les proxies et les originaux doivent-ils avoir les mêmes noms ?", options: ["Pour que la reconnexion soit facile", "Pour gagner de la place", "Pour la couleur", "Ce n'est pas nécessaire"], explanation: "La reconnexion se base sur les noms." },
    { kind: "studio", title: "Préparer le projet pour les proxies", instructions: "Créez deux chutiers, **Originaux** et **Proxies**, et déplacez **au moins 2 vidéos** dans le chutier **Originaux**.", goals: ["Chutier **Originaux**", "Chutier **Proxies**", "Au moins 2 vidéos dans Originaux"] },
    { kind: "match", title: "Associe", pairs: [["Proxy", "Copie légère"], ["Original", "Fichier lourd en qualité"], ["Export", "Utilise les originaux"], ["1/4", "Résolution de lecture réduite"]] },
  ] },
  "gestione-progetto": { title: "Gestion de projet", summary: "Dossiers, noms et versions.", steps: [
    { kind: "theory", title: "Des noms qui parlent", body: ["Un bon nom indique le **client, le projet, le type et la version** : *Pizzeria_Spot30s_v3*. Jamais *final*, *final2*, *final_VRAIMENT* : après une semaine, plus personne ne sait lequel est le bon.", "Le numéro de **version** augmente à chaque livraison au client."] },
    { kind: "quiz", question: "Quel nom de séquence est le meilleur ?", options: ["final_definitif2", "Pizzeria_Spot30s_v3", "Séquence 01", "aaa"], explanation: "Client, format et version : clair pour toujours." },
    { kind: "theory", title: "Une structure qui se répète", body: ["Chaque projet avec les mêmes dossiers : **01_Video**, **02_Audio**, **03_Graphiques**, **04_Export**. Vous retrouverez tout même des années plus tard."] },
    { kind: "quiz", question: "Pourquoi toujours la même structure de dossiers ?", options: ["Pour tout retrouver rapidement dans chaque projet", "Pour gagner de la place", "C'est obligatoire", "Ce n'est pas nécessaire"], explanation: "L'habitude fait gagner du temps et évite les erreurs." },
    { kind: "studio", title: "Renommer et organiser", instructions: "Renommez la séquence en **Pizzeria_Spot_v1** (double-clic sur le nom dans le panneau Projet) et créez un chutier **Export**.", goals: ["Séquence **…_v1**", "Chutier **Export**"] },
  ] },
  "backup": { title: "La sauvegarde", summary: "La règle du 3-2-1.", steps: [
    { kind: "theory", title: "La règle du 3-2-1", body: ["**3** copies des données, sur **2** supports différents, avec **1** hors site (cloud ou un disque chez quelqu'un d'autre). Les disques tombent en panne : c'est juste une question de temps.", "Les rushes originaux sont la chose la plus précieuse : sans eux, le projet ne peut pas être refait."] },
    { kind: "quiz", question: "Que signifie le « 1 » dans la règle 3-2-1 ?", options: ["Une copie hors site", "Un seul disque", "Une sauvegarde par an", "Un seul fichier"], explanation: "Si la maison ou le bureau a un problème, cette copie survit." },
    { kind: "theory", title: "Enregistrer souvent", body: ["**Ctrl+S** toutes les quelques minutes, et **Enregistrer sous** avec une nouvelle version avant les changements importants. Premiere fait aussi des sauvegardes automatiques dans le dossier *Auto-Save*."] },
    { kind: "quiz", question: "Avant un changement drastique, que faut-il faire ?", options: ["Enregistrer une nouvelle version du projet", "Fermer sans enregistrer", "Supprimer les rushes", "Rien"], explanation: "Pour pouvoir revenir en arrière à tout moment." },
    { kind: "studio", title: "Version et sauvegarde", instructions: "Faites un changement (coupez le clip avec **Ctrl+K**), renommez la séquence en **…_v2** et **enregistrez** avec **Ctrl+S**.", goals: ["Un changement a été fait", "Séquence **…_v2**", "Projet **enregistré**"] },
  ] },
  "collaborazione": { title: "La collaboration", summary: "Retours et commentaires client.", steps: [
    { kind: "theory", title: "Les retours", body: ["Le client regarde une **copie de validation** et laisse des **commentaires avec timecodes** (« à 00:00:12, supprimer le texte »). Des outils comme Frame.io connectent les commentaires directement à la timeline.", "Chaque tour de corrections est une **révision** : le devis doit indiquer combien sont incluses (généralement 2)."] },
    { kind: "quiz", question: "Pourquoi les commentaires doivent-ils avoir des timecodes ?", options: ["Pour savoir exactement où intervenir", "Pour allonger la vidéo", "Pour la couleur", "Ce n'est pas nécessaire"], explanation: "« Le passage du milieu » est vague ; 00:00:12:05 ne l'est pas." },
    { kind: "theory", title: "Les marqueurs comme aide-mémoire", body: ["Transformez chaque commentaire en **marqueur** dans la timeline avec le texte dans le champ **Commentaires** (double-clic sur le marqueur). Puis résolvez-les un par un."] },
    { kind: "quiz", question: "Comment transformer un commentaire client en rappel dans la timeline ?", options: ["Avec un marqueur avec commentaire", "Avec une transition", "Avec une nouvelle séquence", "Impossible"], explanation: "Double-clic sur le marqueur → Commentaires." },
    { kind: "studio", title: "Annoter les corrections", instructions: "Le client a demandé deux changements. Ajoutez **2 marqueurs** et écrivez un **commentaire** dans chacun (double-clic sur le marqueur).", goals: ["Au moins **2 marqueurs**", "Avec un **commentaire** écrit"] },
  ] },
  "consegna-cliente": { title: "La livraison client", summary: "Délais, révisions et facturation.", steps: [
    { kind: "theory", title: "Avant de commencer", body: ["Un **devis** clair évite les litiges : ce que vous ferez, pour quand, **combien de révisions**, les formats de livraison, et le prix (avec acompte, souvent 30 à 50 %).", "Les révisions supplémentaires sont facturées à part : écrivez-le dès le départ."] },
    { kind: "quiz", question: "Que doit contenir un devis ?", options: ["Travail, délais, révisions incluses, formats et prix", "Seulement le prix", "Seulement la date", "Rien, juste votre parole"], explanation: "Tout par écrit : ça protège les deux parties." },
    { kind: "theory", title: "La copie de validation", body: ["Pour les retours, envoyez une copie **légère** (720p, faible bitrate) avec un **timecode incrusté** (effet Timecode) : le client peut citer l'endroit exact et ne peut pas utiliser la vidéo sans payer."] },
    { kind: "quiz", question: "Pourquoi incruster le timecode sur la copie de validation ?", options: ["Pour des références précises et pour protéger le travail", "Pour le style", "Pour une meilleure qualité", "Pour la couleur"], explanation: "Double avantage : précision et protection." },
    { kind: "studio", title: "Copie de validation", instructions: "Préparez la copie pour le client : appliquez l'effet **Timecode** (Vidéo) à un clip, puis exportez en **H.264** à **1280×720** avec un bitrate **≤ 5 Mbps**.", hint: "Encore mieux : mettez le Timecode sur un **calque d'ajustement** sur V2, pour qu'il couvre toute la séquence.", goals: ["**Timecode** incrusté", "Export **1280×720** H.264", "Bitrate ≤ **5 Mbps**"] },
  ] },
  "verticale": { title: "Le format 9:16", summary: "Recadrer une vidéo horizontale.", steps: [
    { kind: "theory", title: "D'horizontal à vertical", body: ["Pour transformer une vidéo 16:9 en 9:16, créez une séquence **1080×1920** et **agrandissez** le clip (échelle ~178 %) jusqu'à remplir l'écran. Puis **recadrez** : déplacez l'image pour garder le sujet centré.", "Premiere a aussi l'**Auto Reframe**, qui suit le sujet automatiquement."] },
    { kind: "quiz", question: "Quelle échelle faut-il pour remplir du 1080×1920 avec une vidéo 1920×1080 ?", options: ["Environ 100 %", "Environ 178 %", "Environ 50 %", "Environ 300 %"], explanation: "1920 / 1080 ≈ 1.78 : il faut agrandir la hauteur à 1920." },
    { kind: "theory", title: "Suivre le sujet", body: ["Si le sujet bouge, animez la **Position** avec quelques keyframes : un recadrage manuel, plus précis que l'auto."] },
    { kind: "quiz", question: "Le sujet sort du cadre vertical. Qu'animez-vous ?", options: ["Position", "Volume", "Durée", "Saturation"], explanation: "Vous déplacez l'image dans le cadre." },
    { kind: "studio", title: "Recadrer en vertical", instructions: "Créez une séquence **1080×1920**, mettez l'**interview** dedans, agrandissez à au moins **175 %** et animez la **Position** avec au moins **2 keyframes** pour garder le visage centré.", goals: ["Séquence **1080×1920** avec l'interview", "Échelle ≥ **175 %**", "Position animée"] },
  ] },
  "hook": { title: "L'accroche des 3 premières secondes", summary: "Capter le spectateur immédiatement.", steps: [
    { kind: "theory", title: "Trois secondes pour convaincre", body: ["Sur les réseaux, les gens décident en **1 à 3 secondes** s'ils restent. Les premiers instants ont besoin de **mouvement**, d'une **question** ou d'une **promesse** (« Voici comment j'ai… »), et souvent de texte en grand.", "Ne commencez jamais par un logo lent, un « salut tout le monde » ou un panoramique statique."] },
    { kind: "quiz", question: "Quelle ouverture fonctionne le mieux pour un Reel ?", options: ["Un logo qui tourne pendant 5 secondes", "L'action la plus spectaculaire avec du texte", "Un panoramique statique", "« Salut tout le monde, aujourd'hui… » lentement"], explanation: "Le meilleur tout de suite : les scrolleurs doivent s'arrêter." },
    { kind: "theory", title: "L'astuce du « flash forward »", body: ["Prenez le meilleur moment de la vidéo et **placez-le au début** comme teaser, puis recommencez depuis le début : le spectateur reste pour voir comment on en est arrivé là."] },
    { kind: "quiz", question: "Qu'est-ce qu'un flash forward en ouverture ?", options: ["Montrer le meilleur moment au début", "Un type de LUT", "Un effet audio", "Une transition"], explanation: "Une promesse visuelle de ce qui va suivre." },
    { kind: "studio", title: "Une ouverture qui accroche", instructions: "Cette vidéo commence avec 5 secondes de coucher de soleil statique. Mettez un clip dynamique (**ville** ou **drone**) **au début**, d'une durée **≤ 3 s**, et ajoutez du **texte** qui apparaît dans la première seconde.", goals: ["S'ouvre avec ville ou drone", "Premier clip ≤ **3 s**", "Texte dans la première seconde"] },
  ] },
  "sottotitoli-dinamici": { title: "Sous-titres dynamiques", summary: "Mots surlignés sur le rythme.", steps: [
    { kind: "theory", title: "Le style créateur", body: ["Les **sous-titres dynamiques** affichent **quelques mots à la fois** (1 à 3), en grand, centrés, avec le mot-clé **coloré** et un petit **pop** d'échelle à chaque entrée.", "Ils captent le regard et fonctionnent même sans le son."] },
    { kind: "quiz", question: "Combien de mots à la fois dans un sous-titre dynamique ?", options: ["1 à 3", "La phrase entière", "Un paragraphe", "Aucun"], explanation: "Peu et grands, en rythme avec la voix." },
    { kind: "theory", title: "Le surlignage", body: ["Le mot le plus important de la phrase prend la **couleur de la marque** (jaune, vert…) ou une taille plus grande. Le reste reste blanc avec contour."] },
    { kind: "quiz", question: "Comment met-on en valeur le mot-clé ?", options: ["Avec une couleur différente ou une taille plus grande", "En le cachant", "En petit gris", "On ne le met pas en valeur"], explanation: "La couleur guide l'attention." },
    { kind: "studio", title: "Des mots qui pop", instructions: "Il y a 3 mots. Donnez à **tous** un **pop d'Échelle** (de ~0 à 100) et colorez **un** mot d'une couleur différente du blanc (dans le panneau **Caractère**).", goals: ["Pop d'Échelle sur les 3", "Un mot **coloré**"] },
  ] },
  "ritmo-reel": { title: "Rythme de Reel", summary: "Coupes rapides sur la musique.", steps: [
    { kind: "theory", title: "Rapide, mais pas aléatoire", body: ["Un Reel dynamique change de plan toutes les **0.5 à 1.5 secondes**, mais **sur les beats de la musique** : le rythme doit être ressenti, pas confondu.", "Variez les durées : quelques coupes super rapides, puis un plan qui respire, puis rapide à nouveau."] },
    { kind: "quiz", question: "À quelle fréquence coupe-t-on dans un Reel dynamique ?", options: ["0.5 à 1.5 secondes", "10 secondes", "1 minute", "Jamais"], explanation: "Rapide mais lisible." },
    { kind: "theory", title: "Les marqueurs d'abord", body: ["Marquez les beats avec **M** pendant la lecture, puis montez en vous calant sur les marqueurs. Même méthode que la leçon sur le rythme, en plus rapide."] },
    { kind: "quiz", question: "Quelle est la façon la plus rapide de couper sur le rythme ?", options: ["Marqueurs sur les beats + calage dessus", "À l'œil", "Des coupes au hasard", "Un tuto de 2 heures"], explanation: "La grille de marqueurs fait la moitié du travail." },
    { kind: "studio", title: "Reel sur le beat", instructions: "Les marqueurs sont sur les beats (toutes les 0.8 s). Montez **au moins 6 morceaux** sur V1, chacun **≤ 1.3 s**, sans trous, avec au moins **4 coupes** sur des marqueurs.", hint: "Razor (**C**) sur chaque marqueur, puis suppression ripple des morceaux en trop.", goals: ["Au moins **6 morceaux**", "Chacun ≤ **1.3 s**", "Pas de trous", "**4+ coupes** sur des marqueurs"] },
  ] },
  "thumbnail": { title: "La miniature", summary: "La couverture qui fait cliquer.", steps: [
    { kind: "theory", title: "La couverture vend la vidéo", body: ["Sur YouTube, la **miniature** (thumbnail) décide si quelqu'un clique. Règles : **visage** expressif, **peu de mots** (3 à 4 max) **très gros**, couleurs **contrastées**, lisible même en tout petit.", "Format : **1280×720** (16:9)."] },
    { kind: "quiz", question: "Combien de mots maximum sur une bonne miniature ?", options: ["3 à 4", "20", "Un paragraphe", "Pas de limite"], explanation: "Doit être lisible en un instant, même sur un téléphone." },
    { kind: "theory", title: "Du texte qui ressort", body: ["Le texte a un **contour** épais ou une **ombre** forte, pour être lisible sur n'importe quel fond. Jaune, blanc et rouge sont les classiques."] },
    { kind: "quiz", question: "Quelle taille fait une miniature YouTube ?", options: ["1280×720", "500×500", "1080×1920", "4000×4000"], explanation: "16:9 à 1280×720." },
    { kind: "studio", title: "Créez la miniature", instructions: "Créez une comp **1280×720** appelée **Thumbnail** et ajoutez du **texte** en grand (taille ≥ **120**) avec un **contour** ou une **ombre** activée (panneau Caractère).", goals: ["Comp **1280×720**", "Texte en grand (≥ 120)", "Avec contour ou ombre"] },
  ] },
  "brief": { title: "Le brief", summary: "Comprendre ce que le client veut vraiment.", steps: [
    { kind: "theory", title: "Les bonnes questions", body: ["Le **brief** est le document (ou la conversation) où le client explique ce qu'il veut. Votre travail est de poser les bonnes questions : l'**objectif** de la vidéo, le **public**, **où** elle sera diffusée, la **durée**, le **style** (avec des exemples !), le **délai**, le **budget**.", "Un brief vague produit une vidéo ratée et beaucoup de révisions."] },
    { kind: "quiz", question: "Quelle question n'est PAS essentielle dans un brief ?", options: ["Où sera diffusée la vidéo", "Le public", "La couleur préférée de votre mascotte", "Le délai"], explanation: "Les autres influencent le format, le style et le timing." },
    { kind: "theory", title: "Notre brief", body: ["**Client** : Pizzeria da Squeak. **Objectif** : faire venir du monde samedi soir. **Où** : feed Instagram (**4:5**, 1080×1350). **Durée** : 15 à 30 s. **Style** : chaleureux, rapide, appétissant. **Délai** : vendredi."] },
    { kind: "quiz", question: "La vidéo est pour le feed Instagram en 4:5. Quelle séquence créer ?", options: ["1080×1350", "1920×1080", "1080×1920", "1280×720"], explanation: "4:5 = 1080 de large par 1350 de haut." },
    { kind: "studio", title: "Préparer le projet à partir du brief", instructions: "Créez la séquence pour le brief : **1080×1350**, **30 fps**, nommée **Spot_Pizzeria**.", goals: ["Séquence **1080×1350**", "À **30 fps** (ou 29.97)", "Nommée **Spot_Pizzeria**"] },
  ] },
  "selezione": { title: "La sélection des rushes", summary: "Choisir les meilleurs plans.", steps: [
    { kind: "theory", title: "Tout regarder, peu garder", body: ["Avant de monter, vous **regardez tous** les rushes et choisissez les meilleurs passages : nets, bien exposés, avec la bonne action. Généralement, on utilise **10 à 20 %** de ce qui a été tourné.", "Mettez les sélections dans un chutier **Sélection** et marquez les bons moments avec I/O ou des marqueurs."] },
    { kind: "quiz", question: "Quel pourcentage des rushes finit généralement dans le montage ?", options: ["10 à 20 %", "100 %", "90 %", "1 %"], explanation: "On tourne beaucoup pour choisir le meilleur." },
    { kind: "theory", title: "Ce qu'il faut écarter", body: ["Flou, tremblant, surexposé, personnes qui regardent la caméra par erreur, audio gâché. Et les prises en double : ne garder que la meilleure."] },
    { kind: "quiz", question: "Quel plan écarter en premier ?", options: ["Celui qui est flou", "Celui avec la meilleure action", "Celui bien exposé", "Le meilleur détail"], explanation: "Le flou ne se rattrape pas." },
    { kind: "studio", title: "Le chutier de sélection", instructions: "Créez un chutier **Sélection** et mettez-y les **3 meilleurs clips** pour un spot de nourriture (suggestion : café, ville et interview).", goals: ["Chutier **Sélection**", "Au moins **3 clips** dedans", "**Café** est là"] },
  ] },
  "assemblaggio": { title: "L'assemblage", summary: "Le premier montage brut.", steps: [
    { kind: "theory", title: "Le montage brut", body: ["L'**assemblage** (rough cut) met les sélections dans l'ordre narratif, **sans se soucier des détails**. C'est pour voir si la structure fonctionne.", "C'est normal qu'il soit trop long : on raccourcit après."] },
    { kind: "quiz", question: "À quoi sert le montage brut ?", options: ["Vérifier la structure narrative", "L'étalonnage", "L'export final", "Le mixage audio"], explanation: "La structure d'abord, les détails ensuite." },
    { kind: "theory", title: "Structure d'un spot", body: ["**Accroche** (image forte) → **problème/désir** (samedi soir, faim) → **solution** (la pizzeria, la nourriture) → **appel à l'action** (venez !)."] },
    { kind: "quiz", question: "Quelle est la dernière partie d'un spot ?", options: ["L'appel à l'action", "L'accroche", "Le problème", "Le générique"], explanation: "Dire au spectateur quoi faire : « Réservez maintenant »." },
    { kind: "studio", title: "Assemblez le rough cut", instructions: "Assemblez le spot : au moins **4 clips différents** sur V1 sans trous, de la **musique** sur A2 sous toute la vidéo, durée totale entre **15** et **30 s**.", goals: ["Au moins **4 clips différents** sur V1", "Pas de trous", "Musique sous la vidéo", "Durée **15–30 s**"] },
  ] },
  "fine-cut": { title: "Du rough cut au fine cut", summary: "Affiner le rythme et le récit.", steps: [
    { kind: "theory", title: "Couper, couper, couper", body: ["Du rough cut au **fine cut**, on travaille surtout par **soustraction** : chaque plan ne doit durer que le temps nécessaire. Si une scène n'apporte rien, elle part.", "Corrigez les **raccords** (match cuts, J/L-cuts), fermez les **trous**, vérifiez le **rythme**."] },
    { kind: "quiz", question: "Quelle est l'activité principale dans le passage du rough au fine cut ?", options: ["Supprimer le superflu", "Ajouter des effets", "Rallonger les scènes", "Changer le format"], explanation: "Le meilleur montage est souvent le plus court." },
    { kind: "theory", title: "Regarder comme un spectateur", body: ["Revisionnez le montage du début sans vous arrêter, comme le ferait un spectateur. Là où vous vous ennuyez, coupez. Là où vous ne comprenez pas, ajoutez."] },
    { kind: "quiz", question: "En revisionnant, vous vous ennuyez au milieu. Que faire ?", options: ["Raccourcir ce passage", "Ajouter une transition cube", "Monter la musique", "Rien"], explanation: "L'ennui est le signal qu'il faut couper." },
    { kind: "studio", title: "Affiner le rough cut", instructions: "Ce rough cut a des trous et des plans trop longs. Faites-en un fine cut : **pas de trous**, chaque clip **≤ 4 s**, durée totale **≤ 16 s**.", hint: "Trimmez chaque clip avec l'outil **Ripple (B)** : raccourcissez et les trous se ferment tout seuls.", goals: ["Pas de trous", "Chaque clip ≤ **4 s**", "Durée ≤ **16 s**"] },
  ] },
  "finalizzazione": { title: "Couleur, audio et export", summary: "Finaliser et livrer le projet.", steps: [
    { kind: "theory", title: "La dernière ligne droite", body: ["La **finalisation** : correction colorimétrique et look (**cohérent** sur tous les clips), mixage audio (voix claire, musique en dessous, aucun pic au-dessus de **−1 dB**), titres vérifiés, et **export** au format du brief.", "Avant de livrer : revisionnez **tout** une fois, au casque."] },
    { kind: "quiz", question: "Avant de livrer, que faut-il toujours faire ?", options: ["Tout revisionner au casque", "Rien, livrer tout de suite", "Supprimer le projet", "Changer le format"], explanation: "La vérification finale évite les erreurs embarrassantes." },
    { kind: "theory", title: "Le package de livraison", body: ["Au client : le fichier **final** (H.264 pour les réseaux), éventuellement un **master** de haute qualité et, si convenu, des versions dans différents formats (9:16, 1:1)."] },
    { kind: "quiz", question: "Que contient une livraison client type ?", options: ["Le fichier final plus éventuellement les versions et le master", "Seulement le projet Premiere", "Les rushes bruts", "Rien"], explanation: "Ce qui a été convenu dans le devis." },
    { kind: "studio", title: "Couleur et audio", instructions: "Touches finales : appliquez **Lumetri Color** sur au moins **2 clips** (avec un **Contraste** ≥ **+10**) et amenez la **musique** entre **−22** et **−14 dB**.", goals: ["Lumetri sur **2+ clips** (contraste ≥ +10)", "Musique **−22…−14 dB**"] },
    { kind: "studio", title: "Livrez !", instructions: "Exportez le spot terminé pour le feed : **H.264**, **1080×1350**, bitrate entre **8** et **20 Mbps**. Félicitations : vous avez terminé le cours !", goals: ["**H.264**", "**1080×1350**", "Bitrate **8–20 Mbps**"] },
    { kind: "match", title: "Associe", pairs: [["Brief", "Ce que le client veut"], ["Rough cut", "Première structure"], ["Fine cut", "Rythme affiné"], ["Livraison", "Fichiers finals au client"]] },
  ] },
};

export default fr;
