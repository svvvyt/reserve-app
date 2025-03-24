export const API_BASE_URL = 'https://barbershop.woow.uz/api/v1.0/reservation';

export interface BranchMapObject {
  mainLink: string;
  mainLinkText: string;
  categoryLink: string;
  categoryLinkText: string;
  iframeSrc: string;
  width?: string;
  height?: string;
}

export const BranchMapObjects: BranchMapObject[] = [
  {
    mainLink:
      'https://yandex.ru/maps/org/medny_vsadnik/138197928942/?utm_medium=mapframe&utm_source=maps',
    mainLinkText: 'Медный всадник',
    categoryLink:
      'https://yandex.ru/maps/2/saint-petersburg/category/monument_memorial/137236877779/?utm_medium=mapframe&utm_source=maps',
    categoryLinkText: 'Памятник, мемориал в Санкт‑Петербурге',
    iframeSrc:
      'https://yandex.ru/map-widget/v1/?ll=30.313436%2C59.940413&mode=poi&poi[point]=30.302242%2C59.936384&poi[uri]=ymapsbm1://org?oid=138197928942&z=14.2',
    width: '750px',
    height: '500px',
  },
  {
    mainLink:
      'https://yandex.ru/maps/org/ostrov_novaya_gollandiya/199688219277/?utm_medium=mapframe&utm_source=maps',
    mainLinkText: 'Пример 2',
    categoryLink:
      'https://yandex.ru/maps/2/saint-petersburg/category/park/184106346/?utm_medium=mapframe&utm_source=maps',
    categoryLinkText: 'Категория в Санкт‑Петербурге',
    iframeSrc:
      'https://yandex.ru/map-widget/v1/?ll=30.306921%2C59.924483&mode=poi&poi%5Bpoint%5D=30.289632%2C59.929643&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D199688219277&z=14',
    width: '750px',
    height: '500px',
  },
];
