
-- 1. Create DB only if it doesn't exist
IF DB_ID('TaskManagementDB') IS NULL
    CREATE DATABASE TaskManagementDB;
GO

USE TaskManagementDB;
GO

-- 2. Create Users table only if it doesn't exist
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    CONSTRAINT UQ_Users_Username UNIQUE (Username)
);
GO

-- 3. Create Tasks table only if it doesn't exist
IF OBJECT_ID('dbo.Tasks', 'U') IS NULL
CREATE TABLE Tasks (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATETIME NULL,
    Priority INT NOT NULL DEFAULT 1
);
GO

-- 4. Seed admin user only if not exists
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
    INSERT INTO Users (Username, PasswordHash)
    VALUES ('admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=');
GO

-- 5. Seed tasks
INSERT INTO Tasks (Title, Description, IsCompleted, DueDate, Priority, CreatedAt)
VALUES
    ('Set up development environment', 'Install Node.js, .NET SDK, and SQL Server', 1, NULL, 3, GETDATE()),
    ('Design database schema', 'Create tables for users and tasks', 1, NULL, 3, GETDATE()),
    ('Build REST API', 'Implement CRUD endpoints using .NET Web API', 0, DATEADD(DAY, 3, GETUTCDATE()), 3, GETDATE()),
    ('Create Angular frontend', 'Build task list and form components', 0, DATEADD(DAY, 5, GETUTCDATE()), 2, GETDATE()),
    ('Write unit tests', 'Add tests for API controllers', 0, DATEADD(DAY, 7, GETUTCDATE()), 1, GETDATE()),
    ('Deploy to production', 'Deploy backend and frontend to hosting', 0, DATEADD(DAY, 14, GETUTCDATE()), 2, GETDATE());
GO