const writerOpts = require('../writer-opts');
const { getRawCommit, getContext } = require('../__mocks__');

describe('@cloud-ru/ft-conventional-changelog/write-opts', () => {
  let transform, finalizeContext;

  beforeAll(async () => {
    transform = (await writerOpts).transform;
    finalizeContext = (await writerOpts).finalizeContext;
  });

  it('transform should add shortHash', () => {
    const transformedCommit = transform(getRawCommit());
    expect(transformedCommit.shortHash).toBe('49178dc');
  });

  it('transform should fill scope', () => {
    const transformedCommit = transform(getRawCommit());
    expect(transformedCommit.scope).toBe('FF-1505');
  });

  it('finalizeContext should remove breaking changes commits from commitGroups', () => {
    const getAllCommits = ({ commitGroups }) =>
      commitGroups.reduce((acc, group) => {
        acc.push(...group.commits.map(({ hash }) => hash));
        return acc;
      }, []);
    const context = getContext();

    // до финализации три коммита: 1 багфикс, 1 фича и 1 фича с breaking changes
    expect(getAllCommits(context)).toStrictEqual([
      '4a990ac789586f469419861e2819e6e0e57d39d9',
      'a04e9a72abb39f0836981e1ad6c4b3ca3a845714',
      '49178dcac414bfa34b08d8f94feea73e953393ea',
    ]);

    const finalizedContext = finalizeContext(getContext());

    // после финализации два коммита: 1 багфикс и 1 фича
    expect(getAllCommits(finalizedContext)).toStrictEqual([
      '4a990ac789586f469419861e2819e6e0e57d39d9',
      'a04e9a72abb39f0836981e1ad6c4b3ca3a845714',
    ]);
  });
});
