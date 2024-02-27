import { Organization } from '@luomus/laji-schema';

type OrganizationLevelKey = keyof Pick<Organization, 'organizationLevel1'|'organizationLevel2'|'organizationLevel3'|'organizationLevel4'>;

export function getOrganizationFullName(organization: Organization) {
  const prefix = organization.abbreviation ? organization.abbreviation + ' - ' : '';

  const levelKeys: OrganizationLevelKey[] = [
    'organizationLevel4',
    'organizationLevel3',
    'organizationLevel2',
    'organizationLevel1'
  ];
  const name = levelKeys.map(key => organization[key]?.en).filter(name => !!name).join(', ');

  return prefix + name;
}
