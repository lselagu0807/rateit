-- ============================================
-- RATEIT - Base de datos
-- ============================================

CREATE DATABASE IF NOT EXISTS rateit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rateit;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100),
  rol ENUM('admin','usuario') DEFAULT 'usuario',
  verificado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  website VARCHAR(255),
  logo_emoji VARCHAR(10) DEFAULT '🏢',
  logo_color VARCHAR(7) DEFAULT '#1E2421',
  total_resenas INT DEFAULT 0,
  valoracion_media DECIMAL(3,2) DEFAULT 0.00,
  verificada TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  empresa_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  cuerpo TEXT NOT NULL,
  puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  util_count INT DEFAULT 0,
  verificada TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Contraseña de todos los usuarios de ejemplo: password
INSERT INTO usuarios (nombre, email, password, ciudad, rol, verificado) VALUES
('Admin RateIt', 'admin@rateit.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Madrid', 'admin', 1),
('Alejandro López', 'alejandro@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Madrid', 'usuario', 1),
('María García', 'maria@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Barcelona', 'usuario', 1),
('Carlos Ruiz', 'carlos@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Valencia', 'usuario', 1);

INSERT INTO empresas (nombre, descripcion, categoria, website, logo_emoji, logo_color, total_resenas, valoracion_media, verificada) VALUES
('Amazon', 'Marketplace global de comercio electrónico y servicios en la nube.', 'E-commerce', 'https://amazon.es', '🛒', '#0A2540', 28400, 4.70, 1),
('Mercadona', 'Cadena de supermercados española líder en el mercado nacional.', 'Supermercados', 'https://mercadona.es', '🏪', '#00A651', 19100, 4.50, 1),
('Iberia', 'Aerolínea de bandera española con vuelos nacionales e internacionales.', 'Aerolíneas', 'https://iberia.com', '✈️', '#FF6900', 11200, 4.10, 1),
('BBVA', 'Grupo financiero multinacional con sede en Bilbao.', 'Banca', 'https://bbva.es', '🏦', '#1A1A2E', 8700, 3.10, 1),
('Zara', 'Marca de moda de Inditex con presencia en más de 90 países.', 'Moda', 'https://zara.com', '👗', '#1A1A1A', 15600, 4.30, 1),
('Movistar', 'Operador de telecomunicaciones de Telefónica en España.', 'Telecomunicaciones', 'https://movistar.es', '📱', '#019DF4', 22300, 2.80, 1);

INSERT INTO resenas (usuario_id, empresa_id, titulo, cuerpo, puntuacion, util_count, verificada) VALUES
(2, 1, 'Entrega perfecta, superó mis expectativas', 'Pedí varios artículos y llegaron en tiempo récord. El embalaje estaba impecable y todo en perfecto estado.', 5, 12, 1),
(3, 6, 'Servicio técnico lento, fibra correcta', 'La fibra en sí va bien una vez instalada, pero el proceso fue un calvario. Tres semanas esperando al técnico.', 3, 7, 1),
(4, 3, 'Buena experiencia en tienda, precios altos', 'El personal siempre es muy atento y la variedad de productos es enorme.', 4, 3, 1),
(2, 5, 'Devolución sin complicaciones', 'Tuve que devolver un artículo y el proceso fue muy sencillo. El diseño de la nueva colección está increíble.', 5, 9, 1),
(3, 2, 'Siempre fresco y buen precio', 'Mercadona es mi supermercado de referencia. La fruta siempre fresca, los precios competitivos.', 5, 15, 1),
(4, 4, 'Comisiones abusivas', 'Las comisiones han subido mucho este año. La app funciona bien pero el servicio al cliente es pésimo.', 2, 21, 1);
