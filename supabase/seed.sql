-- ============================================
-- RADIO ESCOLAR - Seed Data
-- Colegio Provincial N.º 10 - La Rioja, Argentina
-- Expo Innovarte 2026
-- ============================================

-- ============================================
-- RADIO SETTINGS (configuración por defecto)
-- ============================================
INSERT INTO public.radio_settings (
  radio_name,
  institution_name,
  welcome_message,
  primary_color,
  secondary_color,
  privacy_policy,
  recording_retention_days,
  allow_simultaneous_broadcasts,
  theme
) VALUES (
  'RADIO ESCOLAR',
  'Colegio Provincial N.º 10',
  '¡Bienvenidos a Radio Escolar! La voz del Colegio Provincial N.º 10 de La Rioja. Sintonizá nuestros canales y participá en vivo.',
  '#6366f1',
  '#ec4899',
  'Radio Escolar es un proyecto educativo del Colegio Provincial N.º 10, La Rioja, Argentina. Toda transmisión es supervisada por docentes. No se recopilan datos personales de los oyentes. Los mensajes del chat son moderados automáticamente y por docentes. Las grabaciones se conservan por un período limitado con fines pedagógicos y requieren consentimiento previo. Cualquier consulta, dirigirse a la dirección del establecimiento.',
  90,
  FALSE,
  'dark'
);

-- ============================================
-- CHAT SETTINGS (configuración por defecto del chat)
-- ============================================
INSERT INTO public.chat_settings (
  is_enabled,
  slow_mode_seconds,
  max_message_length,
  rate_limit_messages,
  rate_limit_window_seconds,
  require_alias
) VALUES (
  TRUE,
  3,
  300,
  5,
  60,
  TRUE
);

-- ============================================
-- CHANNELS (4 canales para Expo Innovarte 2026)
-- ============================================

-- Canal 1: Enigma TV
INSERT INTO public.channels (name, slug, slogan, description, case_file, color, is_active, sort_order)
VALUES (
  'Enigma TV',
  'enigma-tv',
  'Investigar antes de afirmar',
  'Canal dedicado a la investigación y el pensamiento crítico. Nuestros locutores analizan misterios, leyendas urbanas y fenómenos inexplicables desde una perspectiva racional y científica. Cada programa busca separar los hechos de la ficción.',
  'La estación de las sombras',
  '#8b5cf6',
  TRUE,
  1
);

-- Canal 2: Alerta 10
INSERT INTO public.channels (name, slug, slogan, description, case_file, color, is_active, sort_order)
VALUES (
  'Alerta 10',
  'alerta-10',
  'La información es protagonista',
  'El canal informativo de Radio Escolar. Noticias, actualidad, eventos del colegio y de la comunidad riojana. Periodismo escolar comprometido con la verdad y la responsabilidad informativa.',
  'Las luces que nadie puede explicar',
  '#ef4444',
  TRUE,
  2
);

-- Canal 3: Código Misterio
INSERT INTO public.channels (name, slug, slogan, description, case_file, color, is_active, sort_order)
VALUES (
  'Código Misterio',
  'codigo-misterio',
  'Todas las versiones cuentan',
  'Un espacio para explorar las múltiples caras de cada historia. Debates, entrevistas y mesas redondas donde todas las voces son escuchadas. El misterio está en descubrir la verdad entre todas las versiones.',
  'El misterio de la biblioteca',
  '#06b6d4',
  TRUE,
  3
);

-- Canal 4: Punto Paranormal
INSERT INTO public.channels (name, slug, slogan, description, case_file, color, is_active, sort_order)
VALUES (
  'Punto Paranormal',
  'punto-paranormal',
  'El misterio bajo la lupa',
  'El canal que investiga lo inexplicable con rigor y curiosidad. Historias, testimonios y análisis de fenómenos paranormales, siempre desde el respeto y el pensamiento crítico. ¿Será verdad o será leyenda?',
  'La radio que transmite sola',
  '#f59e0b',
  TRUE,
  4
);

-- ============================================
-- BANNED WORDS (palabras prohibidas - español argentino)
-- Categorías: insult, threat, harassment, discrimination, sexual, spam, general
-- ============================================

-- Insultos generales
INSERT INTO public.banned_words (word, category) VALUES ('boludo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('boluda', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('pelotudo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('pelotuda', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('forro', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('forra', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('tarado', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('tarada', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('idiota', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('imbécil', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('imbecil', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('estúpido', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('estupido', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('estúpida', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('estupida', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('mogólico', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('mongolico', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('mogólica', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('mongolica', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('retrasado', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('retrasada', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('inútil', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('inutil', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('nabo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('salame', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('gil', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('gila', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('gilún', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('gilun', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('otario', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('otaria', 'insult');

-- Groserías fuertes
INSERT INTO public.banned_words (word, category) VALUES ('puto', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('puta', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('putazo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('hijo de puta', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('hdp', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('la concha de tu madre', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('conchuda', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('conchudo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('la concha', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('mierda', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('carajo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('verga', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('pija', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('poronga', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('garcha', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('garchá', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('cogeme', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('cogé', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('cógeme', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('coger', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('culiado', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('culiada', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('culiao', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('culo', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('orto', 'insult');
INSERT INTO public.banned_words (word, category) VALUES ('chupame', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('chupala', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('mamada', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('pajero', 'sexual');
INSERT INTO public.banned_words (word, category) VALUES ('pajera', 'sexual');

-- Amenazas
INSERT INTO public.banned_words (word, category) VALUES ('te voy a matar', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te mato', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te cago a trompadas', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te rompo', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te reviento', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te voy a cagar', 'threat');
INSERT INTO public.banned_words (word, category) VALUES ('te pego', 'threat');

-- Discriminación
INSERT INTO public.banned_words (word, category) VALUES ('negro de mierda', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('negra de mierda', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('villero', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('villera', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('cabeza', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('cabecita', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('groncho', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('groncha', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('maricón', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('maricon', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('marica', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('trolo', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('trola', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('tortillera', 'discrimination');
INSERT INTO public.banned_words (word, category) VALUES ('travuco', 'discrimination');

-- Acoso
INSERT INTO public.banned_words (word, category) VALUES ('acosador', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('acosadora', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('suicidate', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('suicidáte', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('matáte', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('matate', 'harassment');
INSERT INTO public.banned_words (word, category) VALUES ('nadie te quiere', 'harassment');

-- Spam
INSERT INTO public.banned_words (word, category) VALUES ('compra ahora', 'spam');
INSERT INTO public.banned_words (word, category) VALUES ('gana dinero', 'spam');
INSERT INTO public.banned_words (word, category) VALUES ('click aquí', 'spam');
INSERT INTO public.banned_words (word, category) VALUES ('http://', 'spam');
INSERT INTO public.banned_words (word, category) VALUES ('https://', 'spam');
INSERT INTO public.banned_words (word, category) VALUES ('www.', 'spam');

-- Regex patterns for evasion attempts
INSERT INTO public.banned_words (word, category, is_regex) VALUES ('p+[u ]+t+[o a]+', 'insult', TRUE);
INSERT INTO public.banned_words (word, category, is_regex) VALUES ('b+[o ]+l+[u ]+d+[o a]+', 'insult', TRUE);
INSERT INTO public.banned_words (word, category, is_regex) VALUES ('p+[e ]+l+[o ]+t+[u ]+d+[o a]+', 'insult', TRUE);
INSERT INTO public.banned_words (word, category, is_regex) VALUES ('h+\s*d+\s*p+', 'insult', TRUE);
INSERT INTO public.banned_words (word, category, is_regex) VALUES ('m+[i ]+[e ]+r+d+a+', 'insult', TRUE);
