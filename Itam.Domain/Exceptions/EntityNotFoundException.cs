namespace Itam.Domain.Exceptions;

public class EntityNotFoundException : Exception
{
    public EntityNotFoundException(string entityName, object key)
        : base($"Entity of type '{entityName}' with identifier '{key}' was not found.")
    {
    }
}