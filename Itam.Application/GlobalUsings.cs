// Resolves CS0104: 'Monitor' is ambiguous between Itam.Domain.Entities.Monitor
// and System.Threading.Monitor (System.Threading is part of the SDK implicit usings).
// A using alias takes precedence over namespace imports, project-wide.
global using Monitor = Itam.Domain.Entities.Monitor;