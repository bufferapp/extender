require 'fileutils'
require 'yaml'

class Build

  attr_accessor 'config', 'files', 'base', 'defaults'

  def initialize(override)
    @defaults = {
      'root' => ".",
      'source' => "extension",
      'targets' => ["chrome", "safari", "firefox"],
      'prefix' => '',
      'target' => '',
      'verbose'=> false
    }
    self.config = self.defaults.merge(self.read_config_file).merge(override)
    puts self.config if config['verbose']
    self.files = []
    self.base = File.join(self.config['root'], self.config['source'])
    unless Dir.exist?(self.base)
      raise "Base directory does not exist. Please check your config."
      exit(1)
    end
  end

  def begin
    self.read_directories
    unless config['simulate']
      self.clear
      self.copy_files
    end
  end

  def read_config_file
    config_file = File.join('_config.yml')
    begin
      config = YAML.load_file(config_file)
      raise "Invalid configuration - #{config_file}" if !config.is_a?(Hash)
      $stdout.puts "Configuration from #{config_file}"
    rescue => err
      $stderr.puts "WARNING: Could not read configuration. " +
                   "Using defaults (and options)."
      $stderr.puts "\t" + err.to_s
      config = {}
    end

    config['targets'] = config['targets'].split(' ') if config['targets']

    return config
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
        puts "File: #{File.join(dir, f)}" if self.config['verbose']
        self.files << File.join(dir, f)
      end
    end
  end

  def clear
    self.files.each do |file|
      self.config['targets'].each do |target_dir|
        target_file = File.join(self.base, config['prefix'] + target_dir, self.config['target'], file)
        puts "Removing: #{target_file}" if self.config['verbose']
        FileUtils.rm(target_file) if File.exist?(target_file)
      end
      
    end
  end

  def copy_files
    self.files.each do |file|
      path = File.join(self.config['root'], self.config['source'], file)
      self.config['targets'].each do |target_dir|
        target_file = File.join(self.config['root'], config['prefix'] + target_dir, self.config['target'], file)
        puts "Adding: #{target_file}" if self.config['verbose']
        FileUtils.mkdir_p(File.dirname(target_file))
        FileUtils.cp(path, target_file)
      end
    end
  end

end