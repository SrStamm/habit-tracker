import { Lecture } from "@habits/shared/lecture";

export const lectureSummary = (lecture?: Lecture): string => {
  const list = lecture ?? [];
  const items = list.length;
  if (items === 0) return "Pendente";

  if (items === 1) {
    const livro = list[0];
    return `${livro.book} · cap. ${livro.chapter} · pág. ${livro.page}`;
  } else {
    const pages = list.reduce((sum, ex) => sum + ex.page, 0);
    return `${items} leituras · ${pages} páginas`;
  }
};
