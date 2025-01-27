import { Organization } from '@luomus/laji-schema';

type OrganizationLevelKey = keyof Pick<Organization, 'organizationLevel1'|'organizationLevel2'|'organizationLevel3'|'organizationLevel4'>;
type OrganizationFullName = Organization['fullName'];

export function getOrganizationFullName(organization: Organization): OrganizationFullName {
  const prefix = organization.abbreviation ? organization.abbreviation + ' - ' : '';
  const langs: ('en'|'fi'|'sv')[] = ['en', 'fi', 'sv'];
  const levelKeys: OrganizationLevelKey[] = [
    'organizationLevel4',
    'organizationLevel3',
    'organizationLevel2',
    'organizationLevel1'
  ];

  const fullName: OrganizationFullName = {};

  langs.forEach(lang => {
    const name = levelKeys.map(key => organization[key]?.[lang]).filter(name => !!name).join(', ');

    if (name) {
      fullName[lang] = prefix + name;
    }
  });

  return fullName;
}
