

export enum Queries {
    SELECT_ALL = 1,
    SELECT_ONCE = 2,
    UPDATE_ALL = 4,
    UPDATE_ONCE = 8,
    INSERT = 16,
    INSERT_IF_SOME = 32,
    INSERT_IF_EVERY = 64,
    SET = 128,
    WIPE = 256,
    INHERIT = 512,
    DELETE = 1024,
    ABSORB = 2048,

}