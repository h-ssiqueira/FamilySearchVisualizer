import { describe, expect, it } from 'vitest';
import { InvalidDataError } from '@/domain';
import { SchemaError } from './errors';

describe('SchemaError is invalid data (TC-15)', () => {
  it('is an InvalidDataError and names only the paths, never the values', () => {
    const error = new SchemaError(['id']);
    expect(error).toBeInstanceOf(InvalidDataError);
    expect(error.paths).toEqual(['id']);
    expect(error.message).not.toMatch(/Secret/);
  });
});
