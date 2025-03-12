export type UserRoleData =
  | {
      rol: string | null;
      modulos: ModulosEnum[];
    }
  | '';

export type SidebarProps = {
  pathname: string;
  role: string | null;
  userModules?: ModulosEnum[] | null;
  isActive: string | undefined;
};
