using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.DTOs;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDir)
    {
        var query = _db.Tasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));

        if (status == "completed")
            query = query.Where(t => t.IsCompleted);
        else if (status == "pending")
            query = query.Where(t => !t.IsCompleted);

        bool descending = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy switch
        {
            "title" => descending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "priority" => descending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "dueDate" => descending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var tasks = await query.ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with id {id} not found." });
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Priority = dto.Priority,
            CreatedAt = DateTime.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _db.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with id {id} not found." });

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.IsCompleted = dto.IsCompleted;
        task.DueDate = dto.DueDate;
        task.Priority = dto.Priority;

        await _db.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with id {id} not found." });

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleComplete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = $"Task with id {id} not found." });

        task.IsCompleted = !task.IsCompleted;
        await _db.SaveChangesAsync();
        return Ok(task);
    }
}
