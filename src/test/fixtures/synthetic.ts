/** Synthetic data only: never paste real FamilySearch data here (SDD NFR-05). */
export const syntheticPersonResponse = {
  id: 'XXXX-XXX',
  name: 'John Example',
  gender: 'MALE',
  living: false,
  ageAtDeath: 99,
  birth: {
    details: {
      date: { formalText: '+1800-12-31', normalizedText: '31 December 1800' },
      place: { id: 1, normalizedText: 'São Paulo, São Paulo, Brazil' },
    },
  },
  death: {
    details: {
      date: { formalText: '+1900-01-01', normalizedText: '1 January 1900' },
      place: { id: 1, normalizedText: 'São Paulo, São Paulo, Brazil' },
    },
  },
  parents: [
    {
      preferred: true,
      parent1: { id: 'AAAA-AAA', name: 'Father Example', gender: 'MALE', living: false },
      parent2: { id: 'BBBB-BBB', name: 'Mother Example', gender: 'FEMALE', living: false },
      event: {
        details: { date: { formalText: null, normalizedText: '2 July 1799' }, place: null },
      },
      children: [
        { child: { id: 'XXXX-XXX', name: 'John Example', gender: 'MALE', living: false } },
        { child: { id: 'CCCC-CCC', name: 'Sibling Example', gender: 'FEMALE', living: false } },
      ],
    },
  ],
  spouses: [
    {
      preferred: true,
      parent1: { id: 'DDDD-DDD', name: 'Jane Example', gender: 'FEMALE', living: false },
      parent2: { id: 'XXXX-XXX', name: 'John Example', gender: 'MALE', living: false },
      event: {
        details: { date: { formalText: '+1825-05-20' }, place: { normalizedText: 'Campinas, Brazil' } },
      },
      children: [
        { child: { id: 'EEEE-EEE', name: 'Child Example', gender: 'FEMALE', living: false } },
      ],
    },
  ],
  // Fields the app must never keep (invented values):
  contributors: [{ name: 'Someone Synthetic', email: 'synthetic@example.invalid' }],
  helperAccessPin: '000000',
};

export const syntheticCurrentUserResponse = {
  users: [
    {
      personId: 'XXXX-XXX',
      displayName: 'John Example',
      gender: 'MALE',
      birthDate: '31 December 1800',
      preferredLanguage: 'pt',
      email: 'synthetic@example.invalid',
      helperAccessPin: '000000',
      contactName: 'Synthetic Contact',
    },
  ],
};
