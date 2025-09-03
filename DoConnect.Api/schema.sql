IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(450) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] varbinary(max) NOT NULL,
    [PasswordSalt] varbinary(max) NOT NULL,
    [Role] int NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [Questions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Questions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Questions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Answers] (
    [Id] int NOT NULL IDENTITY,
    [QuestionId] int NOT NULL,
    [UserId] int NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Answers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Answers_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Answers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Images] (
    [Id] int NOT NULL IDENTITY,
    [Path] nvarchar(max) NOT NULL,
    [QuestionId] int NULL,
    [AnswerId] int NULL,
    CONSTRAINT [PK_Images] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Images_Answers_AnswerId] FOREIGN KEY ([AnswerId]) REFERENCES [Answers] ([Id]),
    CONSTRAINT [FK_Images_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id])
);

CREATE INDEX [IX_Answers_QuestionId] ON [Answers] ([QuestionId]);

CREATE INDEX [IX_Answers_UserId] ON [Answers] ([UserId]);

CREATE INDEX [IX_Images_AnswerId] ON [Images] ([AnswerId]);

CREATE INDEX [IX_Images_QuestionId] ON [Images] ([QuestionId]);

CREATE INDEX [IX_Questions_UserId] ON [Questions] ([UserId]);

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902221737_InitialMigration', N'9.0.8');

COMMIT;
GO

