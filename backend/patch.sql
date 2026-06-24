BEGIN TRANSACTION;
GO

CREATE TABLE [ReturnRequests] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [OrderId] int NOT NULL,
    [ProductId] int NOT NULL,
    [Reason] nvarchar(1000) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_ReturnRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ReturnRequests_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ReturnRequests_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ReturnRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_ReturnRequests_OrderId] ON [ReturnRequests] ([OrderId]);
GO

CREATE INDEX [IX_ReturnRequests_ProductId] ON [ReturnRequests] ([ProductId]);
GO

CREATE INDEX [IX_ReturnRequests_UserId] ON [ReturnRequests] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260624194210_AddReturnRequest', N'8.0.16');
GO

COMMIT;
GO

