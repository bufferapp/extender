require 'fileutils'

class Build

  attr_accessor :config, :files, :base

  @defaults = {
    source: "extension",
    targets: ["chrome", "safari", "firefox"],
    verbose: false
  }

  def initialize(config)
    self.config = config
    self.files = []
    self.base = File.join(self.config[:root], self.config[:source])
    unless Dir.exist?(self.base)
      raise "Base directory does not exist. Please check your config."
      exit(1)
    end
  end

  def begin
    self.read_directories
    self.clear
    self.copy_files
  end

  def read_directories(dir = '')
    path = File.join(self.base, dir)
    # reject dotfiles
    entries = Dir.entries(path).reject { |e| ['.'].include?(e[0..0]) || File.symlink?(e) }
    entries.each do |f|
      f_abs = File.join(path, f)
      if File.directory?(f_abs)
        read_directories(File.join(dir, f))
      else
        puts "File: #{File.join(dir, f)}" if self.config[:verbose]
        self.files << File.join(dir, f)
      end
    end
  end

  def clear
    self.files.each do |file|
      self.config[:targets].each do |target_dir|
        target_file = File.join(self.base, target_dir, file)
        puts "Removing: #{target_file}" if self.config[:verbose]
        FileUtils.rm(target_file) if File.exist?(target_file)
      end
      
    end
  end

  def copy_files
    self.files.each do |file|
      path = File.join(self.config[:root], self.config[:source], file)
      self.config[:targets].each do |target_dir|
        target_file = File.join(self.config[:root], target_dir, file)
        puts "Adding: #{target_file}" if self.config[:verbose]
        FileUtils.mkdir_p(File.dirname(target_file))
        FileUtils.cp(path, target_file)
      end
    end
  end

end