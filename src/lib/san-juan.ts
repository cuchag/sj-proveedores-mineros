/** Los 19 departamentos de la provincia de San Juan. */
export const SAN_JUAN_DEPARTMENTS = [
  "25 de Mayo",
  "9 de Julio",
  "Albardón",
  "Angaco",
  "Calingasta",
  "Capital",
  "Caucete",
  "Chimbas",
  "Iglesia",
  "Jáchal",
  "Pocito",
  "Rawson",
  "Rivadavia",
  "San Martín",
  "Santa Lucía",
  "Sarmiento",
  "Ullum",
  "Valle Fértil",
  "Zonda",
] as const;

export const OUTSIDE_PROVINCE = "Otra provincia";

/**
 * Departamentos del área de influencia de los grandes proyectos mineros.
 * La ley distingue el empleo de "la comunidad" del resto de la provincia.
 * Configurable: ajustar según el proyecto para el que trabaja la empresa.
 */
export const INFLUENCE_AREA_DEPARTMENTS = ["Iglesia", "Jáchal", "Calingasta"];

export function isSanJuanDepartment(department: string): boolean {
  return (SAN_JUAN_DEPARTMENTS as readonly string[]).includes(department);
}
