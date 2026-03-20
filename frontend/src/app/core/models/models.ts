// ============================================
// RATEIT - Modelos de datos
// ============================================

export interface Empresa {
  id:               number;
  nombre:           string;
  descripcion:      string;
  categoria:        string;
  website:          string;
  logo_emoji:       string;
  logo_color:       string;
  total_resenas:    number;
  valoracion_media: number;
  verificada:       boolean;
  created_at:       string;
  updated_at:       string;
}

export interface EmpresaForm {
  nombre:      string;
  descripcion: string;
  categoria:   string;
  website:     string;
  logo_emoji:  string;
  logo_color:  string;
  verificada:  boolean;
}

export interface Resena {
  id:                number;
  usuario_id:        number;
  empresa_id:        number;
  titulo:            string;
  cuerpo:            string;
  puntuacion:        number;
  util_count:        number;
  verificada:        boolean;
  created_at:        string;
  updated_at:        string;
  usuario_nombre:    string;
  empresa_nombre:    string;
  empresa_categoria: string;
}

export interface ResenaForm {
  usuario_id:  number;
  empresa_id:  number;
  titulo:      string;
  cuerpo:      string;
  puntuacion:  number;
}

export interface ApiResponse {
  id?:     number;
  message: string;
  error?:  string;
}

export const CATEGORIAS: string[] = [
  'E-commerce', 'Supermercados', 'Aerolíneas', 'Banca',
  'Telecomunicaciones', 'Moda', 'Tecnología', 'Salud',
  'Automoción', 'Hostelería', 'Seguros', 'Educación', 'Otros',
];
