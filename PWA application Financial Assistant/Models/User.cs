public class User
{
    public int id { get; set; }
    public string email { get; set; }
    public string username { get; set; }
    public string passwordHash { get; set; } // если используется
    public DateTime createdAt { get; set; } = DateTime.UtcNow;

    public string avatarPath { get; set; }
}
